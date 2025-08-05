import { getAccessToken } from "@/lib/cookies";
import tokenStore from "@/store/tokenStore";
import { FILE_ACTION, TFile, TreeItem } from "@/types/drive-storage";
import { APIStatus, callAPI } from "./callAPI";
export const getGGDriveStorage = async (folderId: string = "root") => {
  const res = await callAPI<TFile[]>(`/api/storage/folder/${folderId}/files`, {
    next: {
      revalidate: 0,
    },
  });
  if (res.status !== APIStatus.OK) return [];
  return res.data;
};

export const getFileTree = async () => {
  return await callAPI<TreeItem[]>("/api/storage/tree", {
    next: {
      revalidate: 0,
    },
  });
};

export const createFolder = async (name: string, folderId: string) => {
  const res = await callAPI("/api/storage", {
    method: "POST",
    body: JSON.stringify({
      action: FILE_ACTION.CREATE_FOLDER,
      createFolder: {
        name,
        folderId: folderId ?? "root",
      },
    }),
  });
  return res;
};

export const deleteFiles = async (fileIds: string[]) => {
  const res = await callAPI("/api/storage", {
    method: "POST",
    body: JSON.stringify({
      action: FILE_ACTION.MOVE_TO_TRASH,
      moveFilesToTrash: {
        fileIds,
      },
    }),
  });
  return res;
};

export const renameFile = async (fileId: string, name: string) => {
  const res = await callAPI("/api/storage", {
    method: "POST",
    body: JSON.stringify({
      action: FILE_ACTION.RENAME,
      renameFile: {
        fileId,
        name,
      },
    }),
  });
  return res;
};

export const moveFile = async (fileIds: string[], folderId: string) => {
  const res = await callAPI("/api/storage", {
    method: "POST",
    body: JSON.stringify({
      action: FILE_ACTION.MOVE,
      moveFiles: {
        fileIds,
        destinationFolderId: folderId ?? "root",
      },
    }),
  });
  return res;
};

export const copyFile = async (fileIds: string[], folderId: string) => {
  const res = await callAPI("/api/storage", {
    method: "POST",
    body: JSON.stringify({
      action: FILE_ACTION.COPY,
      copyFiles: {
        fileIds,
        destinationFolderId: folderId ?? "root",
      },
    }),
  });
  return res;
};

export const downloadFile = async (fileId: string) => {
  const res = await callAPI(`/api/storage/file/${fileId}/download`, {});
  return res;
};

export const handleUpload = async (files: FileList, folderId: string) => {
  if (!folderId)
    return { status: APIStatus.BAD_REQUEST, message: "Folder not found" };
  if (!files?.length)
    return { status: APIStatus.BAD_REQUEST, message: "No file selected" };
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });
  formData.append("folderId", folderId);
  let token = "";
  // getAccessToken là server fuction, gọi trực tiếp từ client sẽ dẫn đến bug crash css page ngẫu nhiên
  if (typeof window === "undefined") {
    token = (await getAccessToken())?.value || "";
  } else {
    token = tokenStore.getState().token;
  }

  const res = await callAPI("/api/storage/upload", {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });
  return res;
};

export const checkNameExists = (names: string[]) => {
  return callAPI("/api/storage/check-name", {
    method: "POST",
    body: JSON.stringify({
      names,
    }),
  });
};

export const getFileLinks = (ids: string[]) => {
  return callAPI<string[]>("/api/storage/get-links", {
    query: {
      ids: ids.join(","),
    },
  });
};
