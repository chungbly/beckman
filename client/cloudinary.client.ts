import { getAccessToken } from "@/lib/cookies";
import tokenStore from "@/store/tokenStore";
import {
  CloudinaryFile,
  CloudinaryFolder,
  CloudinaryFolderTree,
} from "@/types/cloudinary";
import { callAPI } from "./callAPI";

export const getFolderTree = () => {
  return callAPI<CloudinaryFolderTree[]>("/api/cloudinary/folder-tree", {});
};

export const getSubFolders = (path: string) => {
  return callAPI<CloudinaryFolder[]>("/api/cloudinary/folders", {
    query: {
      path,
    },
  });
};

export const getFolder = (folderId: string) => {
  return callAPI<CloudinaryFolder>("/api/cloudinary/folder", {
    query: {
      id: folderId,
    },
  });
};

export const getFolderFiles = (path: string) => {
  return callAPI<CloudinaryFile[]>("/api/cloudinary/list", {
    query: {
      path,
    },
  });
};

export const createFolder = (
  name: string,
  folder: {
    folderId?: string;
    folderPath?: string;
  }
) => {
  return callAPI("/api/cloudinary/folder", {
    method: "POST",
    body: JSON.stringify({
      ...folder,
      name,
    }),
  });
};

export const uploadFile = async (
  files: FileList,
  path: string,
  domain: string = "https://beckman.vn"
) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });
  formData.append("path", path);
  formData.append("domain", domain);

  let token = "";
  // getAccessToken là server fuction, gọi trực tiếp từ client sẽ dẫn đến bug crash css page ngẫu nhiên
  if (typeof window === "undefined") {
    token = (await getAccessToken())?.value || "";
  } else {
    token = tokenStore.getState().token;
  }

  return await callAPI<CloudinaryFile[]>("/api/cloudinary/upload", {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });
};

export const checkNameExists = (names: string[], currentFolderPath: string) => {
  return callAPI<string[]>("/api/cloudinary/check-name", {
    method: "POST",
    body: JSON.stringify({
      names,
      currentFolderPath,
    }),
  });
};

export const deleteFiles = (ids: string[]) => {
  return callAPI("/api/cloudinary/files", {
    method: "DELETE",
    body: JSON.stringify({
      ids,
    }),
  });
};

export const renameFile = (id: string, name: string) => {
  return callAPI("/api/cloudinary/files/re-name", {
    method: "POST",
    body: JSON.stringify({
      id,
      newName: name,
    }),
  });
};

export const moveFiles = (
  ids: string[],
  folder: {
    folderPath?: string;
    folderId?: string;
  }
) => {
  return callAPI("/api/cloudinary/files/move", {
    method: "POST",
    body: JSON.stringify({
      ids,
      ...folder,
    }),
  });
};

export const copyFiles = (
  ids: string[],
  folder: {
    folderPath?: string;
    folderId?: string;
  }
) => {
  return callAPI("/api/cloudinary/files/copy", {
    method: "POST",
    body: JSON.stringify({
      ids,
      ...folder,
    }),
  });
};

export const deleteFolders = (ids: string[]) => {
  return callAPI("/api/cloudinary/folder", {
    method: "DELETE",
    body: JSON.stringify({
      ids,
    }),
  });
};

export const renameFolder = (folderId: string, name: string) => {
  return callAPI("/api/cloudinary/folder/re-name", {
    method: "POST",
    body: JSON.stringify({
      folderId,
      name,
    }),
  });
};
