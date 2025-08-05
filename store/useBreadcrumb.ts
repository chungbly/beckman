import { create } from "zustand";

type Breadcrumb = {
  name: string;
  href?: string;
};

type UseBreadcrumb = {
  breadcrumb: Breadcrumb[];
  setBreadcrumb: (breadcrumb: Breadcrumb[]) => void;
};

export const useBreadcrumb = create<UseBreadcrumb>((set) => ({
  breadcrumb: [],
  setBreadcrumb: (breadcrumb: Breadcrumb[]) => set({ breadcrumb }),
}));
