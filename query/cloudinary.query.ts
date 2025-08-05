import { getFolderFiles, getFolderTree, getSubFolders } from "@/client/cloudinary.client";

export const getFolderTreeQuery = {
  queryKey: ["cloudinary-folder-tree"],
  queryFn: async () => {
    const res = await getFolderTree();
    return [
      {
        name: "Gốc",
        path: "",
        id: "root",
        children: res?.data || [],
      },
    ];
  },
};

export const getFileInFolderQuery = (path: string) => {
  return {
    queryKey: ["cloudinary-folder-files", path],
    queryFn: async () => {
      const res = await getFolderFiles(path);
      return res?.data || [];
    },
  };
};

export const getSubFoldersQuery = (path: string) => {
  return {
    queryKey: ["cloudinary-sub-folders", path],
    queryFn: async () => {
      const res = await getSubFolders(path);
      return res?.data || [];
    },
  };
}