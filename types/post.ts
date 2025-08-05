import { Meta } from "./api-response";
import { Product } from "./product";

export interface Author {
  _id: string;
  fullName: string;
  email: string;
  gender: string;
  photo: string;
  quote: string;
}

export interface Post {
  _id: string;
  deletedAt: null;
  authorId: string;
  author: Author;
  content: string;
  tags: string[];
  images: string[];
  isMagazine: boolean;
  isShow: boolean;
  isSlide: boolean;
  isOutStanding: boolean;
  title: string;
  subDescription: string;
  seo: SEO;
  view: number;
  createdAt: string;
  updatedAt: string;
  productRelated: Product[];
}

export interface PostWithMeta {
  items: Post[];
  meta: Meta;
}

interface SEO {
  thumbnail?: string;
  title?: string;
  slug?: string;
  description?: string;
  keywords?: string;
}

export interface GetPostQuery {
  ids?: string[];
  title?: string;
  isShow?: boolean;
  authorId?: string;
  isMagazine?: boolean;
  isSlide?: boolean;
  isOutStanding?: boolean;
  getRandom?: boolean;
  slug?: string;
  tags?: string[];
  sort?: {
    [key: string]: 1 | -1;
  };
}
