//src/shared/store/useEditMode.ts
import { create } from "zustand";

interface EditModeState {
  isEditMode: boolean;
  toggleEditMode: () => void;
}

export const useEditMode = create<EditModeState>((set) => ({
  isEditMode: false,
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
}));
