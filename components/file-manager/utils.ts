import { CloudinaryFolderTree } from "@/types/cloudinary";

export const getFolderById = (
  id: string,
  tree: CloudinaryFolderTree[]
): CloudinaryFolderTree | null => {
  if (!tree.length || !id || id === "root")
    return {
      id: "root",
      path: "",
      name: "Gốc",
      children: [],
    };
  for (const element of tree) {
    if (element.id === id) return element;
    if (element.children?.length) {
      const folder = getFolderById(id, element.children);
      if (folder) return folder;
    }
  }
  return null;
};

export const getParentIds = (
  tree: CloudinaryFolderTree[],
  id: string
): string[] => {
  if (!tree.length || !id || id === "root") return [];
  for (const element of tree) {
    if (element.id === id) return [id];
    if (element.children?.length) {
      const parentIds = getParentIds(element.children, id);
      if (parentIds.length) return [element.id, ...parentIds];
    }
  }
  return [];
};


