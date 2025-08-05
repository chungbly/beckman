export interface Comment {
  _id: string;
  customerId?: string;
  externalOrderCode?: string;
  internalOrderCode?: string;
  deletedAt: string;
  author: string;
  avatar: string;
  productId: number;
  rating: number;
  content: string;
  images: string[];
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
}
