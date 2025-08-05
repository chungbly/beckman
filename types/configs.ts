export interface Configs {
  _id: string;
  deletedAt: null;
  key: string;
  value: string;
  description: string;
  isShow: boolean;
}

export interface CreateConfigInput {
  key: string;
  value: string;
}

export interface UpdateConfigInput {
  id: number;
  key?: string;
  value?: string;
}
