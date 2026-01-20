import Constants from "expo-constants";
import {
  safeFetch,
  ServiceResponse,
} from "@/services/consumet";

export interface AnimeMeta {
  anilistId: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage?: string;
  genres?: string[];
  episodes?: number;
  status?: string;
}

interface AniListTitle {
  romaji?: string;
  english?: string;
  native?: string;
}

interface AniListCoverImage {
  large?: string;
  medium?: string;
}

interface AniListMedia {
  id: number;
  title: AniListTitle;
  description?: string;
  coverImage?: AniListCoverImage;
  genres?: string[];
  episodes?: number;
  status?: string;
}

interface AniListSearchData {
  Page: {
    media: AniListMedia[];
  };
}

interface AniListDetailsData {
  Media: AniListMedia | null;
}

const getApiUrl = () => {
  const envUrl =
    Constants.expoConfig?.extra?.anilistApi ??
    process.env.EXPO_PUBLIC_ANILIST_API;

  if (typeof envUrl === "string" && envUrl.length > 0) {
    return envUrl;
  }

  return "https://graphql.anilist.co";
};

const mapMediaToMeta = (media: AniListMedia): AnimeMeta => {
  return {
    anilistId: media.id,
    title: {
      romaji: media.title.romaji,
      english: media.title.english,
      native: media.title.native,
    },
    description: media.description,
    coverImage: media.coverImage?.large || media.coverImage?.medium,
    genres: media.genres,
    episodes: media.episodes,
    status: media.status,
  };
};

export const searchAnime = async (
  query: string,
): Promise<ServiceResponse<AnimeMeta[]>> => {
  const url = getApiUrl();

  const body = {
    query: `
      query SearchAnime($search: String) {
        Page(perPage: 20) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            coverImage {
              large
              medium
            }
            genres
            episodes
            status
          }
        }
      }
    `,
    variables: {
      search: query,
    },
  };

  const result = await safeFetch<{ data?: AniListSearchData }>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (result.status === "ok" && result.data?.data) {
    const media = result.data.data.Page.media || [];
    const metas = media.map(mapMediaToMeta);
    return { status: "ok", data: metas };
  }

  return {
    status: "error",
    message: result.message || "Failed to search anime on AniList",
  };
};

export const getAnimeDetails = async (
  anilistId: number,
): Promise<ServiceResponse<AnimeMeta>> => {
  const url = getApiUrl();

  const body = {
    query: `
      query GetAnimeDetails($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          coverImage {
            large
            medium
          }
          genres
          episodes
          status
        }
      }
    `,
    variables: {
      id: anilistId,
    },
  };

  const result = await safeFetch<{ data?: AniListDetailsData }>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (result.status === "ok" && result.data?.data?.Media) {
    const meta = mapMediaToMeta(result.data.data.Media);
    return { status: "ok", data: meta };
  }

  return {
    status: "error",
    message: result.message || "Failed to load anime details from AniList",
  };
};

