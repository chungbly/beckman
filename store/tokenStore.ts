import { createStore } from "zustand/vanilla";
type TokenStore = {
  token: string;
  setToken: (token: string) => void;
  getToken: () => string;
};
const tokenStore = createStore<TokenStore>((set, get) => ({
  token: "",
  setToken: (token: string) =>
    set({
      token,
    }),
  getToken: () => get().token,
}));

export default tokenStore;
