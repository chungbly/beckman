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
  discribles: string[];
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
  categories: string[];
  finalPrice: number; // Math.min(basePrice, salePrice); salePrice > 0
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  isShow: boolean;
  averageRating: number;
}

 interface Image {
  color: string;
  urls: string[];
}

 interface KvAttribute {
  productId: number;
  attributeName: string;
  attributeValue: string;
}

 interface SEO {
  thumbnail: string;
  title: string;
  slug: string;
  description: string;
  keywords: string;
}
