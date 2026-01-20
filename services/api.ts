import { Platform } from "react-native";

const ANIMEPAHE_BASE_URL = "https://animepahe.si/api";

// Use a reliable CORS proxy for Web to bypass browser restrictions
// corsproxy.io is generally stable.
const CORS_PROXY = "https://corsproxy.io/?";

const getHeaders = (): Record<string, string> => {
  if (Platform.OS === "web") {
    // Browsers control User-Agent, so we don't set it manually to avoid "Refused to set unsafe header" errors
    // We only set what's necessary and allowed
    return {};
  }

  // For mobile, we mimic a real browser to avoid anti-bot blocks
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: "https://animepahe.si/",
    Origin: "https://animepahe.si",
  };
};

const getApiUrl = (url: string) => {
  if (Platform.OS === "web") {
    // Encode the target URL and append to proxy
    return `${CORS_PROXY}${encodeURIComponent(url)}`;
  }
  return url;
};

// Interface for AnimePahe Search Result
interface AnimePaheSearchResult {
  id: number;
  title: string;
  type: string;
  episodes: number;
  status: string;
  season: string;
  year: number;
  score: number;
  poster: string;
  session: string; // This is crucial for fetching episodes
}

// Adapter to transform AnimePahe API data to our App's Anime interface
const adaptAnimePaheToAnime = (item: any): Anime => {
  // Use session as ID if available, as it's required for episode fetching
  // Fallback to numeric ID if session is missing
  const uniqueId = item.session || item.id;

  return {
    id: uniqueId,
    name: item.title || "Unknown Title",
    overview:
      item.summary ||
      `A ${item.type || "TV"} anime from ${item.year || "unknown year"}.`,
    poster_path: item.poster || null,
    backdrop_path: item.poster || null, // AnimePahe doesn't provide backdrops in search
    vote_average: item.score ? Number(item.score) : 0,
    vote_count: 0,
    first_air_date: item.year ? String(item.year) : "Unknown",
    original_language: "ja",
    original_name: item.title,
    popularity: item.score ? item.score * 10 : 0,
    adult: false,
    genre_ids: [],
    episodes: item.episodes || 0,
    status: item.status || "Unknown",
    type: item.type || "TV",
    season: "1",
    year: item.year || 0,
  };
};

export const fetchAnimes = async ({ query }: { query: string }) => {
  // If query is empty, we default to "One Piece" or similar to show *something*
  const searchQuery = query ? encodeURIComponent(query) : "One Piece";
  const endpoint = `${ANIMEPAHE_BASE_URL}?m=search&q=${searchQuery}`;

  try {
    const url = getApiUrl(endpoint);
    // console.log(`Fetching Animes from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Log the status but don't crash the app, throw to trigger fallback
      console.warn(`AnimePahe fetch failed: ${response.status}`);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // AnimePahe search structure: { total: 100, per_page: 8, ... data: [...] }
    const results = data.data || [];

    // Filter out items without sessions if that's critical, or just map all
    return results.map(adaptAnimePaheToAnime);
  } catch (error) {
    console.log("Returning mock data due to API connectivity issue:", error);

    // Fallback mock data with UNBLOCKED image URLs (placehold.co)
    return [
      {
        id: "mock-1",
        name: "One Piece (Mock)",
        adult: false,
        backdrop_path: "https://placehold.co/600x400/png?text=One+Piece",
        genre_ids: [1, 2],
        original_language: "ja",
        original_name: "One Piece",
        overview:
          "Gol D. Roger was known as the 'Pirate King', the strongest and most infamous being to have sailed the Grand Line...",
        popularity: 9.9,
        poster_path: "https://placehold.co/400x600/png?text=One+Piece",
        first_air_date: "1999",
        vote_average: 8.7,
        vote_count: 10000,
        episodes: 1000,
        status: "Currently Airing",
        type: "TV",
        season: 1,
        year: 1999,
      },
      {
        id: "mock-2",
        name: "Naruto (Mock)",
        adult: false,
        backdrop_path: "https://placehold.co/600x400/png?text=Naruto",
        genre_ids: [1, 2],
        original_language: "ja",
        original_name: "Naruto",
        overview:
          "Moments prior to Naruto Uzumaki's birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox, attacked Konohagakure...",
        popularity: 9.8,
        poster_path: "https://placehold.co/400x600/png?text=Naruto",
        first_air_date: "2002",
        vote_average: 8.3,
        vote_count: 9000,
        episodes: 220,
        status: "Finished Airing",
        type: "TV",
        season: 1,
        year: 2002,
      },
    ];
  }
};

export const getAnimeEpisodes = async (id: string | number) => {
  // For AnimePahe, 'id' here should be the 'session' hash (e.g., "56789abc")
  // Endpoint: ?m=release&id={session}&sort=episode_asc&page=1
  const endpoint = `${ANIMEPAHE_BASE_URL}?m=release&id=${id}&sort=episode_asc&page=1`;

  try {
    const url = getApiUrl(endpoint);
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.warn(`AnimePahe episodes fetch failed: ${response.status}`);
      throw new Error("Failed to fetch episodes");
    }

    const data = await response.json();

    // AnimePahe release structure: { current_page: 1, data: [ { id: 1, episode: 1, ... } ] }
    const episodes = data.data || [];

    return episodes.map((ep: any) => ({
      id: ep.id, // This might be the specific episode ID
      name: `Episode ${ep.episode}`,
      episode_number: ep.episode,
      air_date: ep.created_at || "Unknown",
      still_path: ep.snapshot || null,
      overview: `Episode ${ep.episode}`,
    }));
  } catch (error) {
    console.warn("Episode fetch failed, returning mock episodes", error);
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Episode ${i + 1}`,
      episode_number: i + 1,
      air_date: "2024-01-01",
      still_path: null,
      overview: "Mock episode description...",
    }));
  }
};
