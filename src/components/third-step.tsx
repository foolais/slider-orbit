import useGridData from "../store/useGridData";
import MediaUploader from "./media-uploader";

const LAYOUTS: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1",
  3: "grid-cols-2 grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

const ThirdStep = () => {
  const { gridData } = useGridData();

  if (gridData.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-gray-500">No selection</p>
      </div>
    );
  }

  const sorted = [...gridData].sort((a, b) => a.id - b.id);

  return (
    <div
      className={`grid gap-2 w-screen h-dvh p-2 ${
        LAYOUTS[sorted.length] ?? LAYOUTS[4]
      }`}
    >
      {sorted.map((item, index) => (
        <div
          key={item.id}
          className={`min-w-0 min-h-0 overflow-hidden bg-black rounded-lg ${
            sorted.length === 3 && index === 0 ? "col-span-2" : ""
          }`}
        >
          <MediaUploader id={item.id} />
        </div>
      ))}
    </div>
  );
};

export default ThirdStep;