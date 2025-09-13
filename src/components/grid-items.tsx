import useGridData from "../store/useGridData";

const GridItems = () => {
  const { gridData, addGridData, removeGridData } = useGridData();
  const rectangles = [1, 2, 3, 4];

  const toggleSelection = (id: number) => {
    if (gridData.find((item) => item.id === id)) {
      removeGridData(id);
    } else {
      addGridData(id);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {rectangles.map((rect) => {
        const selected = gridData.find((item) => item.id === rect);
        return (
          <div
            key={rect}
            onClick={() => toggleSelection(rect)}
            className={`p-16 rounded cursor-pointer flex items-center justify-center transition-all
              ${selected ? "primary-bg border-3" : "primary-border"}`}
          >
            {rect}
          </div>
        );
      })}
    </div>
  );
};

export default GridItems;
