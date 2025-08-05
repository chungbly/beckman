export interface Embed {
  _id: string;
  deletedAt: null;
  name: string;
  position: EmbedPosition;
  scope: string[];
  pageType: string;
  isActive: boolean;
  code: string;
}

export enum EmbedPosition {
  HEAD = "HEAD",
  BODY = "BODY",
}
