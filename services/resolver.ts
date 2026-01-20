import type { AnimeMeta } from "@/services/anilist";
import {
  searchAnime as searchConsumetAnime,
  ServiceResponse,
  ConsumetSearchResult,
} from "@/services/consumet";

const normalize = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return value
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const scoreTitleMatch = (a: string, b: string): number => {
  const na = normalize(a);
  const nb = normalize(b);

  if (!na || !nb) {
    return 0;
  }

  if (na === nb) {
    return 100;
  }

  if (na.includes(nb) || nb.includes(na)) {
    return 85;
  }

  const aWords = new Set(na.split(" "));
  const bWords = new Set(nb.split(" "));

  const intersection = new Set<string>();
  aWords.forEach((w) => {
    if (bWords.has(w)) {
      intersection.add(w);
    }
  });

  if (intersection.size === 0) {
    return 0;
  }

  const avgLen = (aWords.size + bWords.size) / 2;
  return (intersection.size / avgLen) * 70;
};

const pickBestMatch = (
  anime: AnimeMeta,
  results: ConsumetSearchResult[],
): ConsumetSearchResult | null => {
  const titles = [
    anime.title.english,
    anime.title.romaji,
    anime.title.native,
  ].filter(Boolean) as string[];

  if (titles.length === 0 || results.length === 0) {
    return null;
  }

  let best: ConsumetSearchResult | null = null;
  let bestScore = 0;

  for (const candidate of results) {
    const candidateTitle = candidate.title;
    if (!candidateTitle) {
      continue;
    }

    let scoreForCandidate = 0;
    for (const t of titles) {
      const score = scoreTitleMatch(t, candidateTitle);
      if (score > scoreForCandidate) {
        scoreForCandidate = score;
      }
    }

    if (scoreForCandidate > bestScore) {
      bestScore = scoreForCandidate;
      best = candidate;
    }
  }

  if (!best) {
    return null;
  }

  if (bestScore < 50) {
    return null;
  }

  return best;
};

export const resolveConsumetId = async (
  anime: AnimeMeta,
): Promise<ServiceResponse<string | null>> => {
  const primaryTitle =
    anime.title.english || anime.title.romaji || anime.title.native;

  if (!primaryTitle) {
    return {
      status: "error",
      data: null,
      message: "Anime has no searchable title",
    };
  }

  const searchResult = await searchConsumetAnime(primaryTitle);

  if (searchResult.status === "error") {
    return {
      status: "error",
      data: null,
      message:
        searchResult.message ||
        "Failed to search anime on streaming provider",
    };
  }

  const best = pickBestMatch(anime, searchResult.data || []);

  if (!best) {
    return {
      status: "error",
      data: null,
      message: "Unable to resolve streaming provider ID for this anime",
    };
  }

  return {
    status: "ok",
    data: best.id,
  };
};

