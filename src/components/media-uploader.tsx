import { useEffect, useRef, useState } from "react";
import useGridData from "../store/useGridData";
import {
  Play,
  Shuffle,
  Trash,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MediaUploader = ({ id }: { id: number }) => {
  const { gridData, addMediaToGrid, removeMediaFromGrid, randomizeMedia } =
    useGridData();
  const item = gridData.find((i) => i.id === id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isImageLooping, setIsImageLooping] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto slideshow (images only)
  useEffect(() => {
    if (!item || item.media.length === 0) return;

    const currentMedia = item.media[currentIndex];
    if (!currentMedia) return;

    if (
      isPlaying &&
      (currentMedia.type === "image" || currentMedia.type === "gif")
    ) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev + 1 >= item.media.length) {
            return isImageLooping ? 0 : prev;
          }
          return prev + 1;
        });
      }, 3000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, item, currentIndex, isImageLooping]);

  // Control video play/pause
  useEffect(() => {
    const currentMedia = item?.media[currentIndex];
    if (currentMedia?.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, item]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      let type: "video" | "image" | "gif" = "image";

      if (file.type.startsWith("video")) {
        type = "video";
      } else if (file.type === "image/gif") {
        type = "gif";
      }

      addMediaToGrid(id, { type, url });
    });
  };

  if (!item) return null;

  const media = item.media[currentIndex];

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % item.media.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + item.media.length) % item.media.length
    );
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-black text-white relative overflow-hidden"
      onClick={() => setIsPlaying((p) => !p)}
    >
      {media ? (
        media.type === "image" ? (
          <img
            src={media.url}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={media.url}
            className="max-w-full max-h-full object-contain"
            muted
            controls={false}
            loop={isLooping}
            onEnded={() => {
              if (isPlaying && !isLooping) {
                handleNext();
              }
            }}
          />
        )
      ) : (
        <span className="text-gray-400">No media for {id}</span>
      )}

      {/* Upload button */}
      <label className="absolute bottom-2 right-2 bg-white text-black px-2 py-1 rounded cursor-pointer text-sm">
        Upload
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </label>

      {/* Prev / Next buttons */}
      {item.media.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
            onClick={handlePrev}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
            onClick={handleNext}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Controls (when paused) */}
      {!isPlaying && item.media.length > 0 && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
          <button
            className="bg-blue-500 px-3 py-1 rounded flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(true);
            }}
          >
            <Play size={16} />
            Resume
          </button>

          <button
            className="bg-green-500 px-3 py-1 rounded flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              randomizeMedia(id);
              setCurrentIndex(0);
            }}
          >
            <Shuffle size={16} />
            Randomize
          </button>

          {(media?.type === "image" || media?.type === "gif") && (
            <button
              className="bg-yellow-500 px-3 py-1 rounded flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageLooping((prev) => !prev);
              }}
            >
              <RefreshCcw size={16} />
              {isImageLooping ? "Unloop Images" : "Loop Images"}
            </button>
          )}

          {media?.type === "video" && (
            <button
              className="bg-yellow-500 px-3 py-1 rounded flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsLooping((prev) => !prev);
              }}
            >
              <RefreshCcw size={16} />
              {isLooping ? "Unloop" : "Loop"}
            </button>
          )}

          <button
            className="bg-red-500 px-3 py-1 rounded flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              removeMediaFromGrid(id, currentIndex);
              setCurrentIndex(0);
            }}
          >
            <Trash size={16} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
