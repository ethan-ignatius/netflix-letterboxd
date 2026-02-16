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
  | LetterboxdIndexUpdatedMessage
  | LetterboxdIndexUpdatedAckMessage;
