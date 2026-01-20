import Constants from "expo-constants";

export type ServiceStatus = "ok" | "error";

export interface ServiceResponse<T> {
  status: ServiceStatus;
  data?: T;
  message?: string;
}

const getBaseUrl = () => {
  const url = Constants.expoConfig?.extra?.consumetBaseUrl
    ? String(Constants.expoConfig.extra.consumetBaseUrl)
    : process.env.EXPO_PUBLIC_CONSUMET_API_BASE_URL;

  if (!url) {
    return "";
  }

  return url.replace(/\/+$/, "");
};

export const safeFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<ServiceResponse<T>> => {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        try {
          const json = await response.json();
          const message =
            (json && (json.message || json.error || json.reason)) ||
            `HTTP ${response.status}`;
          return { status: "error", message };
        } catch {
          return {
            status: "error",
            message: `HTTP ${response.status}`,
          };
        }
      }

      if (contentType.includes("text/html")) {
        const text = await response.text();
        const snippet = text.substring(0, 120).replace(/\s+/g, " ").trim();
        return {
          status: "error",
          message: snippet || `HTTP ${response.status}`,
        };
      }

      return {
        status: "error",
        message: `HTTP ${response.status}`,
      };
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      const snippet = text.substring(0, 120).replace(/\s+/g, " ").trim();
      return {
        status: "error",
        message: snippet || "Received non-JSON response from server",
      };
    }

    const data = (await response.json()) as T;
    return { status: "ok", data };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "Network request failed",
    };
  }
};

export interface ConsumetSearchResult {
  id: string;
  title: string;
  image?: string;
  rating?: number;
  releaseDate?: string | number;
  type?: string;
}

export interface ConsumetSearchResponse {
  results: ConsumetSearchResult[];
}

export interface ConsumetEpisode {
  id: string;
  number?: number;
  title?: string;
  image?: string;
  duration?: string;
}

export interface ConsumetAnimeInfo {
  id: string;
  title: string;
  image?: string;
  cover?: string;
  description?: string;
  genres?: string[];
  status?: string;
  type?: string;
  releaseDate?: string;
  aired?: string;
  studios?: string[];
  totalEpisodes?: number;
  episodes: ConsumetEpisode[];
  episodePages?: number;
}

export interface ConsumetEpisodeSource {
  url: string;
  quality?: string;
  isM3U8?: boolean;
  headers?: Record<string, string>;
}

export interface ConsumetEpisodeSourcesResponse {
  headers?: Record<string, string>;
  sources: ConsumetEpisodeSource[];
}

export const searchAnime = async (
  title: string,
): Promise<ServiceResponse<ConsumetSearchResult[]>> => {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return {
      status: "error",
      message: "Consumet base URL is not configured",
    };
  }

  const encoded = encodeURIComponent(title.trim());
  const url = `${baseUrl}/anime/animepahe/${encoded}`;

  const result = await safeFetch<ConsumetSearchResponse>(url);
  if (result.status === "ok" && result.data) {
    return { status: "ok", data: result.data.results || [] };
  }

  return {
    status: "error",
    message: result.message || "Failed to search anime on provider",
  };
};

export const getAnimeInfo = async (
  consumetId: string,
  episodePage?: number,
): Promise<ServiceResponse<ConsumetAnimeInfo>> => {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return {
      status: "error",
      message: "Consumet base URL is not configured",
    };
  }

  const encoded = encodeURIComponent(consumetId);
  const url =
    typeof episodePage === "number"
      ? `${baseUrl}/anime/animepahe/info/${encoded}?episodePage=${episodePage}`
      : `${baseUrl}/anime/animepahe/info/${encoded}`;

  const result = await safeFetch<ConsumetAnimeInfo>(url);
  if (result.status === "ok" && result.data) {
    return result;
  }

  return {
    status: "error",
    message: result.message || "Failed to load anime info from provider",
  };
};

export const getEpisodeSources = async (
  episodeId: string,
): Promise<ServiceResponse<ConsumetEpisodeSource[]>> => {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return {
      status: "error",
      message: "Consumet base URL is not configured",
    };
  }

  const encoded = encodeURIComponent(episodeId);
  const url = `${baseUrl}/anime/animepahe/watch?episodeId=${encoded}`;

  const result = await safeFetch<ConsumetEpisodeSourcesResponse>(url);
  if (result.status === "ok" && result.data) {
    const headers = result.data.headers || {};
    const sourcesWithHeaders =
      (result.data.sources || []).map((s) => ({ ...s, headers })) || [];
    return { status: "ok", data: sourcesWithHeaders };
  }

  return {
    status: "error",
    message: result.message || "Failed to load episode sources",
  };
};
