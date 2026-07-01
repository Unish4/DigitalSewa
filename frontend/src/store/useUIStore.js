import { create } from "zustand";

const useUIStore = create((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  modal: { type: null, data: null },
  openModal: (type, data = null) => set({ modal: { type, data } }),
  closeModal: () => set({ modal: { type: null, data: null } }),
}));

export default useUIStore;
