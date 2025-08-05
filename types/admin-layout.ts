import { Post } from "./post";
import { Product } from "./product";
export type SlideType = "Product" | "Magazine";
export interface LayoutItem {
  id: string;
  type: "Banner" | "Product" | "Scrollable";
  x: number;
  y: number;
  w: number;
  h: number;
  image?: string;
  href?: string;
  isDesktop?: boolean;
  isMobile?: boolean;
  productId?: number;
  product?: Product;
  products?: Product[]; // for slide type Product
  productIds?: number[]; // for slide type Product
  magazineIds?: string[]; // for slide type  Magazine
  magazines?: Post[]; // for slide type Magazine
  slideType?: SlideType;
}
export interface HightlightCategoryLayout {
  id: string;
  name: string;
  height?: number;
  items: LayoutItem[];
  cols: number;
}

export interface SubMenuLayout extends Omit<HightlightCategoryLayout, "name"> {
  height: number;
}
