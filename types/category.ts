export interface Category {
  _id: string;
  backgroundColor: string;
  createdAt: string;
  deletedAt: string;
  description: string;
  thumbnail: string;
  desktopBanner: string;
  clotheTags?: string[];
  accessoryTags?: string[];
  isApplyForAllChildren: boolean;
  isShow: boolean;
  sizeSelectionGuide: string;
  mobileBanner: string;
  name: string;
  groupName: string;
  parentId: string | null;
  products: number[];
  seo: SEO;
  textColor: string;
  updatedAt: string;
  children?: Category[];
  index?: number; // for sorting
  filterJSON?: string;
  header?: {
    html: string;
    css: string;
    project: string;
  };
}

export interface SEO {
  description: string;
  title: string;
  slug: string;
  tags: string;
  thumbnail: string;
}
