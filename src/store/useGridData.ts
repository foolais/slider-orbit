import { create } from "zustand";

type Media = {
  type: "image" | "video" | "gif";
  url: string;
};

type GridItem = {
  id: number;
  media: Media[];
};

type GridStore = {
  gridData: GridItem[];
  addGridData: (id: number) => void;
  removeGridData: (id: number) => void;
  clearGridData: () => void;
  addMediaToGrid: (id: number, media: Media) => void;
  removeMediaFromGrid: (id: number, index: number) => void;
  randomizeMedia: (id: number) => void;
};

const useGridData = create<GridStore>((set) => ({
  gridData: [],
  addGridData: (id) =>
    set((state) => {
      if (state.gridData.find((item) => item.id === id)) return state;
      return { gridData: [...state.gridData, { id, media: [] }] };
    }),
  removeGridData: (id) =>
    set((state) => ({
      gridData: state.gridData.filter((item) => item.id !== id),
    })),
  clearGridData: () => set({ gridData: [] }),
  addMediaToGrid: (id, media) =>
    set((state) => ({
      gridData: state.gridData.map((item) =>
        item.id === id ? { ...item, media: [...item.media, media] } : item
      ),
    })),

  removeMediaFromGrid: (id) =>
    set((state) => ({
      gridData: state.gridData.map((item) =>
        item.id === id ? { ...item, media: [] } : item
      ),
    })),
  randomizeMedia: (id) =>
    set((state) => ({
      gridData: state.gridData.map((item) =>
        item.id === id
          ? {
              ...item,
              media: [...item.media].sort(() => Math.random() - 0.5),
            }
          : item
      ),
    })),
}));

export default useGridData;
