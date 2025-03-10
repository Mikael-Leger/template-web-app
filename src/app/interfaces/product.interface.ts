export interface ProductItem {
  title: string;
  image: string;
  short_description?: string;
  long_description?: string;
  price?: PriceType;
  priceByDosage?: string;
  quantity?: string;
  tags?: string[];
  hide?: boolean;
}

export type PriceType = number | {
  new: number;
  old: number;
}