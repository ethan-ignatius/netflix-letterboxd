export type LetterboxdIndexLegacyEntry = {
  r?: number;
  w?: 1;
};

export type LetterboxdIndexLegacy = Record<string, LetterboxdIndexLegacyEntry>;

export type LetterboxdIndex = {
  ratingsByKey: Record<string, number>;
  watchlistKeys: Record<string, true>;
  updatedAt: number;
};

export type LetterboxdStats = {
  importedAt: string;
  ratingsCount: number;
  watchlistCount: number;
};

export interface LetterboxdExportMeta {
  importedAt: string;
  filmCount: number;
}

export interface LetterboxdFilm {
  title: string;
  year?: number;
  rating?: number;
  watchedDate?: string;
}

export interface LetterboxdExport {
  meta: LetterboxdExportMeta;
  films: LetterboxdFilm[];
}

export type OverlayData = {
  title: string;
  year?: number | null;
  tmdb?: {
    id: number | null;
    voteAverage: number | null;
    voteCount: number | null;
  };
  letterboxd?: {
    inWatchlist: boolean;
    userRating: number | null;
    matchPercent: number | null;
    becauseYouLike: string[];
  };
};

export type ExtractedTitleInfo = {
  rawTitle: string;
  normalizedTitle: string;
  year?: number | null;
  isSeries?: boolean;
  netflixId?: string | null;
  href?: string | null;
};

export type ResolveOverlayDataPayload = ExtractedTitleInfo;

export type ResolveOverlayDataMessage = {
  type: "RESOLVE_OVERLAY_DATA";
  requestId: string;
  payload: ResolveOverlayDataPayload;
};

export type OverlayDataResolvedMessage = {
  type: "OVERLAY_DATA_RESOLVED";
  requestId: string;
  payload: OverlayData;
};

export type ResolveTitlePayload = {
  netflixTitleId?: string;
  titleText?: string;
  year?: number;
  href?: string;
};

export type ResolveTitleMessage = {
  type: "RESOLVE_TITLE";
  requestId: string;
  payload: ResolveTitlePayload;
};

export type TitleResolvedMessage = {
  type: "TITLE_RESOLVED";
  requestId: string;
  payload: {
    title: string;
    tmdbId?: number;
    tmdbVoteAverage?: number;
    tmdbVoteCount?: number;
    posterPath?: string;
    releaseYear?: number;
    tmdbMediaType?: "movie" | "tv";
    inWatchlist?: boolean;
    userRating?: number;
    matchScore?: number;
    matchExplanation?: string;
  };
};

export type ExtensionMessage = ResolveTitleMessage | TitleResolvedMessage;

export type LetterboxdIndexUpdatedMessage = {
  type: "LB_INDEX_UPDATED";
};

export type LetterboxdIndexUpdatedAckMessage = {
  type: "LB_INDEX_UPDATED_ACK";
  payload: {
    updatedAt: number;
  };
};

export type ExtensionRuntimeMessage =
  | ExtensionMessage
  | ResolveOverlayDataMessage
  | OverlayDataResolvedMessage
  | LetterboxdIndexUpdatedMessage
  | LetterboxdIndexUpdatedAckMessage;
