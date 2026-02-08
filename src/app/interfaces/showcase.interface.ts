export interface ShowcaseImage {
  path: string;
  style?: Record<string, unknown>;
  alt?: string;
  animations?: {
    to: Record<string, unknown>;
  }[];
}

export interface ShowcaseStorageItem {
  id?: string;
  title: string;
  url: string;
  images: ShowcaseImage[];
  cardWidth?: number;
  cardHeight?: number;
  backgroundColor?: string;
  hide?: boolean;
  _isStatic?: boolean;
}
