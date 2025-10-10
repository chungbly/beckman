import { Category } from "./category";

interface Describle {
  title: string;
  content: string;
}

export interface Product {
  _id: string;
  deletedAt: null;
  kvId: number;
  kvCode: string;
  kvName: string;
  kvFullName: string;
  kvCategoryId: number;
  kvHasVariants: boolean;
  kvMasterProductId: null;
  kvIsActive: boolean;
  basePrice: number;
  description: string;
  kvAttributes: KvAttribute[];
  color: string;
  size: string;
  slug: string;
  onHand: number;
  stock: number;
  salePrice: number;
  name: string;
  subName: string;
  secondSubName: string;
  discribles: Describle[];
  careInstructions: string;
  warrantyPolicy: string;
  subDescription: string;
  similarProducts: Product[];
  recommendedProducts: Product[];
  images: Image[];
  seo: SEO;
  shippingFee: number;
  sold: number;
  gifts: string[];
  logo: string;
  frame: string;
  tags: string[];
  sizeTags: string[];
  colorTags: string[];
  suggestionTags: string[];
  categories: Category[];
  finalPrice: number; // Math.min(basePrice, salePrice); salePrice > 0
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  isShow: boolean;
  averageRating: number;
}

interface Image {
  color: string;
  altName: string;
  thumbnail: string;
  urls: string[];
}

interface KvAttribute {
  productId: number;
  attributeName: string;
  attributeValue: string;
}

export interface SEO {
  thumbnail: string;
  title: string;
  slug: string;
  description: string;
  keywords: string;
}
