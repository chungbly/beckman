import { APIStatus } from "@/client/callAPI";
import { getFileTree, getGGDriveStorage } from "@/client/storage.client";
import { FolderTree } from "@/types/drive-storage";

export const getFolderTree = {
  queryKey: ["file-manager-folder-tree"],
  queryFn: async () => {
    const res = await getFileTree();
    const tree = [
      {
        id: "root",
        name: "Gốc",
        children: [] as FolderTree[],
      },
    ];
    if (res.status !== APIStatus.OK || !res.data?.length) return tree;
    tree[0].children = res.data;
    return tree;
  },
};

export const getFolderByIdQuery = (currentFolderId: string) => {
  return {
    queryKey: ["file-manager-folder", currentFolderId],
    queryFn: async () => {
      if (!currentFolderId) return [];
      const data = await getGGDriveStorage(currentFolderId);
      return data;
    },
    enable: !!currentFolderId,
  };
};
