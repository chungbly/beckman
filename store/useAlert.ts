import React from "react";
import { create } from "zustand";

type UseAlertState = {
  title: React.ReactNode;
  description: React.ReactNode;
  header?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  isOpen: boolean;
  variant: "destructive" | "info" | "success" | "warning";

  onClose?: () => void;
  onSubmit?: () => void;
};

type UseAlert = UseAlertState & {
  setAlert: (alert: Partial<UseAlertState>) => void;
  closeAlert: () => void;
};

export const useAlert = create<UseAlert>((set, get) => ({
  title: "",
  description: "",
  header: null,
  isOpen: false,
  variant: "info",
  content: null,
  footer: null,
  setAlert: (alert) => set({ ...alert, isOpen: true }),
  closeAlert: () =>
    set({
      isOpen: false,
      title: "",
      description: "",
      header: null,
      variant: "info",
      content: null,
      footer: null,
    }),
  onClose: () => {
    get().closeAlert();
  },
  onSubmit: () => {
    get().closeAlert();
  },
}));
