export interface CloudinaryFolder {
  name: string;
  path: string;
  id: string;
}

export interface CloudinaryFolderTree extends CloudinaryFolder {
  children: CloudinaryFolderTree[];
}

export interface CloudinaryFile {
  _id: string;
  asset_id: string;
  public_id: string;
  asset_folder: string;
  filename: string;
  display_name: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  uploaded_at: string;
  bytes: number;
  backup_bytes: number;
  width: number;
  height: number;
  aspect_ratio: number;
  pixels: number;
  url: string;
  secure_url: string;
  status: string;
  access_mode: string;
  access_control: any;
  etag: string;
  created_by: CreatedBy;
  uploaded_by: UploadedBy;
}

export interface CreatedBy {
  access_key: string;
}

export interface UploadedBy {
  access_key: string;
}
