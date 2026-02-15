export type StorageKeys =
  | "letterboxdExport"
  | "lastImportAt"
  | "overlayEnabled"
  | "tmdbApiKey"
  | "tmdbCache";

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
  };
};

export type ExtensionMessage = ResolveTitleMessage | TitleResolvedMessage;
