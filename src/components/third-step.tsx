import useGridData from "../store/useGridData";
import MediaUploader from "./media-uploader";

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

  const has = (id: number) => sorted.some((item) => item.id === id);

  const Cell = ({ id, isFull }: { id: number; isFull?: boolean }) => (
    <div
      className={`w-full h-full
 overflow-hidden flex flex-1 items-center justify-center bg-black rounded-lg ${
   isFull ? "" : " max-w-[400px] max-h-[400px]"
 }`}
    >
      <MediaUploader id={id} />
    </div>
  );

  return (
    <div className="w-screen h-screen flex flex-col gap-2 p-2 box-border">
      {sorted.length === 1 && <Cell id={sorted[0].id} isFull />}
      {(has(1) || has(2)) && sorted.length != 1 && (
        <div
          className={`grid gap-2 ${
            has(1) && has(2) ? "grid-cols-2" : "grid-cols-1"
          }  flex-1`}
        >
          {has(1) && <Cell id={1} />}
          {has(2) && <Cell id={2} />}
        </div>
      )}

      {(has(3) || has(4)) && sorted.length != 1 && (
        <div
          className={`grid gap-2 ${
            has(3) && has(4) ? "grid-cols-2" : "grid-cols-1"
          }  flex-1`}
        >
          {has(3) && <Cell id={3} />}
          {has(4) && <Cell id={4} />}
        </div>
      )}
    </div>
  );
};

export default ThirdStep;
