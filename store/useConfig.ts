import { create } from "zustand";

type UseConfigs = {
  configs: Record<string, unknown>;
  setConfigs: (configs: Record<string, unknown>) => void;
};

export const useConfigs = create<UseConfigs>((set) => ({
  configs: {},
  setConfigs: (configs) => set({ configs }),
}));
