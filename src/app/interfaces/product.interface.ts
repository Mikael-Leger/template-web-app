export interface ProductItem {
  title: string;
  image: string;
  short_description?: string;
  long_description?: string;
  price?: number;
  tags?: string[];
}