export type StorageKeys = "letterboxdExport" | "lastImportAt";

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
