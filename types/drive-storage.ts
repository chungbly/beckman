import { ReactFormExtendedApi } from "@tanstack/react-form";
import { CloudinaryFile } from "./cloudinary";

export interface TreeItem {
  name: string;
  id: string;
  children: TreeItem[];
}

export interface TFile {
  mimeType: string;
  parents: string[];
  iconLink: string;
  id: string;
  name: string;
  trashed: boolean;
  modifiedTime: Date;
  type: string;
  size: number;
  url: string;
}

export enum FileType {
  GOOGLE_FOLDER = "GOOGLE_FOLDER",
  PNG = "PNG",
  JPEG = "JPEG",
  WEBP = "WEBP",
}

export enum FILE_ACTION {
  OPEN = "OPEN",
  RENAME = "RENAME",
  DELETE = "DELETE",
  MOVE_TO_TRASH = "MOVE_TO_TRASH",
  COPY = "COPY",
  MOVE = "MOVE",
  GET_URL = "GET_URL",
  DOWNLOAD = "DOWNLOAD",
  CREATE_FOLDER = "CREATE_FOLDER",
}

export type FolderTree = {
  id: string;
  name: string;
  children: FolderTree[];
};

export type FileManagerData = {
  imageToViewUrl: string;
  selectedFiles: CloudinaryFile[];
  selectedFileId: string;
  deleteFileIds: string[];
  deleteFolderIds: string[];
  renameFolderId: string;
  copyFileIds: string[];
  moveFileIds: string[];
  isCreatingFolder: boolean;
  uploadingFiles: FileList | null;
  uploadingStatus: "uploading" | "error" | "completed" | null;
  layout: "grid" | "list";
  search: string;
};

export type FileManagerContextProps = {
  currentFolderPath: string;
  handleCreateFolder: (name: string) => void;
  handleOpenFolder: (folderId: string) => void;
  handleDrop: (e: React.DragEvent<HTMLButtonElement>, targetId: string) => void;
  handleRename: (id: string, name: string) => void;
  handleGetUrl: (fileId: string) => void;
  form: ReactFormExtendedApi<FileManagerData, undefined>;
  singleSelect: boolean;
};
