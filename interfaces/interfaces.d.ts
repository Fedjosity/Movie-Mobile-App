interface Anime {
  id: number | string; // AnimePahe uses string session IDs sometimes, or number IDs.
  name: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  episodes?: number;
  status?: string;
  type?: string;
  season?: string;
  year?: number;
}

interface TrendingAnime {
  searchTerm: string;
  anime_id: number;
  name: string;
  count: number;
  poster_url: string;
}

interface AnimeDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_name: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  first_air_date: string;
  revenue: number;
  episode_run_time: number[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  name: string;
  vote_average: number;
  vote_count: number;
}

interface TrendingCardProps {
  anime: TrendingAnime;
  index: number;
}
