export interface CarouselSlide {
  _id?: string;
  image: string;
  mobileImage: string;
  order: number;
  newTab: boolean;
  active: boolean;
  href: string;
  createdAt?: Date;
  updatedAt?: Date;
}
