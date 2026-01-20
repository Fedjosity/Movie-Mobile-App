import type { ServiceResponse } from "@/services/consumet";
import { searchAnime as searchAnimePahe } from "@/services/consumet";

const MOCK_ANIMES: Anime[] = [
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
    season: "1",
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
    season: "1",
    year: 2002,
  },
];

const mapAnimePaheToAnime = (meta: {
  id: string;
  title: string;
  image?: string;
  rating?: number;
  releaseDate?: string | number;
  type?: string;
}): Anime => {
  const poster =
    meta.image ||
    "https://via.placeholder.com/400x600/1a1a1a/ffffff.png?text=No+Cover";

  return {
    id: meta.id,
    name: meta.title,
    adult: false,
    backdrop_path:
      typeof meta.image === "string" && meta.image.length > 0
        ? meta.image
        : "https://via.placeholder.com/600x400/1a1a1a/ffffff.png?text=No+Cover",
    genre_ids: [],
    original_language: "ja",
    original_name: meta.title,
    overview:
      "Anime details are unavailable. Open the details screen for more information.",
    popularity: 0,
    poster_path: poster,
    first_air_date:
      typeof meta.releaseDate === "number"
        ? String(meta.releaseDate)
        : meta.releaseDate || "Unknown",
    vote_average: meta.rating ?? 0,
    vote_count: 0,
    episodes: undefined,
    status: undefined,
    type: meta.type,
    season: "1",
    year: typeof meta.releaseDate === "number" ? meta.releaseDate : undefined,
  };
};

export const fetchAnimes = async ({
  query,
}: {
  query: string;
}): Promise<ServiceResponse<Anime[]>> => {
  const searchQuery = query && query.trim().length > 0 ? query : "One Piece";

  const result = await searchAnimePahe(searchQuery);

  if (result.status === "ok" && result.data) {
    const animes = result.data.map(mapAnimePaheToAnime);
    return { status: "ok", data: animes };
  }

  return {
    status: "error",
    data: MOCK_ANIMES,
    message: result.message || "Failed to load anime from AnimePahe",
  };
};
