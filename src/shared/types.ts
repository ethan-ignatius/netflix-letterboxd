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

export type XrayCastEntry = {
  id: number;
  name: string;
  character?: string | null;
  order?: number;
  profilePath?: string | null;
};

/** One actor identified in the paused frame (scene-level X-Ray). */
export type XraySceneActor = {
  name: string;
  character?: string | null;
  photoUrl?: string | null;
  confidence: number;
  faceBox?: { x: number; y: number; width: number; height: number };
};

export type AnalyzeFramePayload = {
  tabId: number;
  netflixTitleId: string;
  titleText?: string;
  year?: number;
  tmdbId?: number;
  tmdbMediaType?: "movie" | "tv";
  timestamp: number;
};

export type AnalyzeFrameMessage = {
  type: "ANALYZE_FRAME";
  requestId: string;
  payload: AnalyzeFramePayload;
};

export type XrayFrameResultMessage = {
  type: "XRAY_FRAME_RESULT";
  requestId: string;
  payload: {
    actors: XraySceneActor[];
    noFaces?: boolean;
    drmBlocked?: boolean;
    error?: string;
  };
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

export type ResolveXrayPayload = ResolveTitlePayload;

export type ResolveXrayMessage = {
  type: "RESOLVE_XRAY";
  requestId: string;
  payload: ResolveXrayPayload;
};

export type XrayResolvedMessage = {
  type: "XRAY_RESOLVED";
  requestId: string;
  payload: {
    title: string;
    tmdbId?: number;
    tmdbMediaType?: "movie" | "tv";
    cast: XrayCastEntry[];
  };
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
  | ResolveXrayMessage
  | XrayResolvedMessage
  | AnalyzeFrameMessage
  | XrayFrameResultMessage
  | LetterboxdIndexUpdatedMessage
  | LetterboxdIndexUpdatedAckMessage;
