import { useEffect, useRef, useState } from "react";
import useGridData from "../store/useGridData";
import {
  Play,
  Shuffle,
  Trash,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Music,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const SPEEDS = [0.5, 0.75, 1, 1.5];

const formatTime = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const MediaUploader = ({ id }: { id: number }) => {
  const { gridData, addMediaToGrid, removeMediaFromGrid, randomizeMedia } =
    useGridData();
  const item = gridData.find((i) => i.id === id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isImageLooping, setIsImageLooping] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Video sound
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoVolume, setVideoVolume] = useState(1);

  // Video seek
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Audio state
  const [audio, setAudio] = useState<{ url: string; name: string } | null>(
    null
  );
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [isAudioLooping, setIsAudioLooping] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);

  // UI state
  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto slideshow (images only)
  useEffect(() => {
    if (!item || item.media.length === 0) return;

    const currentMedia = item.media[currentIndex];
    if (!currentMedia) return;

    if (isPlaying && currentMedia.type === "image") {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev + 1 >= item.media.length) {
            return isImageLooping ? 0 : prev;
          }
          return prev + 1;
        });
      }, 4000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, item, currentIndex, isImageLooping]);

  // Control video play/pause + mute + volume
  useEffect(() => {
    const currentMedia = item?.media[currentIndex];
    const video = videoRef.current;
    if (currentMedia?.type === "video" && video) {
      video.muted = isVideoMuted;
      video.volume = videoVolume;
      if (isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [isPlaying, currentIndex, item, isVideoMuted, videoVolume]);

  // Reset seek state when switching media
  useEffect(() => {
    setVideoTime(0);
    setVideoDuration(0);
  }, [currentIndex]);

  // Control audio play/pause
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audio) return;

    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying, audio]);

  // Audio speed
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = audioSpeed;
  }, [audioSpeed, audio]);

  // Audio loop
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isAudioLooping;
  }, [isAudioLooping, audio]);

  // Audio volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume;
  }, [audioVolume, audio]);

  // Clean up audio object URL when replaced / unmounted
  useEffect(() => {
    return () => {
      if (audio) URL.revokeObjectURL(audio.url);
    };
  }, [audio]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);

      let type: "video" | "image" = "image";

      if (file.type.startsWith("video")) {
        type = "video";
      }

      addMediaToGrid(id, { type, url });
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudio({ url: URL.createObjectURL(file), name: file.name });
    setAudioSpeed(1);
    e.target.value = "";
  };

  const handleRemoveAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    setAudio(null);
    setIsAudioLooping(false);
    setAudioSpeed(1);
    setAudioVolume(1);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setVideoTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const isLoopActive = media?.type === "video" ? isLooping : isImageLooping;

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      onClick={() => setIsPlaying((p) => !p)}
    >
      {media ? (
        media.type === "video" ? (
          <video
            ref={videoRef}
            src={media.url}
            className="absolute inset-0 w-full h-full object-contain"
            controls={false}
            loop={isLooping}
            onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setVideoTime(e.currentTarget.currentTime)}
            onEnded={() => {
              if (isPlaying && !isLooping) {
                handleNext();
              }
            }}
          />
        ) : (
          <img
            src={media.url}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No media for {id}
        </div>
      )}

      {/* Hidden audio element (stays mounted when the panel is closed) */}
      {audio && <audio ref={audioRef} src={audio.url} preload="auto" />}

      {/* Upload button */}
      <label
        className="absolute bottom-2 right-2 z-20 bg-white text-black px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium shadow hover:bg-gray-200 transition"
        onClick={(e) => e.stopPropagation()}
      >
        Upload
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </label>

      {/* Video seek slider */}
      {media?.type === "video" &&
        Number.isFinite(videoDuration) &&
        videoDuration > 0 && (
          <div
            className="absolute bottom-2 left-12 right-24 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 h-9 text-white text-[11px] sm:text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="tabular-nums w-9 text-right">
              {formatTime(videoTime)}
            </span>
            <input
              type="range"
              min={0}
              max={videoDuration}
              step={0.1}
              value={videoTime}
              onChange={handleSeek}
              className="flex-1 min-w-0 accent-blue-500 cursor-pointer"
            />
            <span className="tabular-nums w-9">
              {formatTime(videoDuration)}
            </span>
          </div>
        )}

      {/* Audio: popup panel (relative to the cell) */}
      {isAudioPanelOpen && (
        <div
          className="absolute bottom-12 left-2 right-2 sm:right-auto sm:w-56 z-30 max-h-[calc(100%-3.5rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-neutral-900/95 backdrop-blur-md text-white text-[11px] sm:text-xs shadow-xl p-2 sm:p-3 flex flex-col gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
              <Music size={14} />
              Audio
            </span>
            <button
              className="p-1 rounded-md hover:bg-white/10 cursor-pointer"
              onClick={() => setIsAudioPanelOpen(false)}
              title="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Video volume (always visible) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-white/60">
              <span>
                Video volume{" "}
                {isVideoMuted ? "(muted)" : `${Math.round(videoVolume * 100)}%`}
              </span>
              <button
                className={`p-1 rounded-md cursor-pointer transition ${
                  isVideoMuted
                    ? "bg-red-600 text-white"
                    : "hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setIsVideoMuted((m) => !m)}
                title="Mute / unmute video"
              >
                {isVideoMuted || videoVolume === 0 ? (
                  <VolumeX size={13} />
                ) : (
                  <Volume2 size={13} />
                )}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={videoVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVideoVolume(v);
                if (v > 0 && isVideoMuted) setIsVideoMuted(false); // dragging up unmutes
              }}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {!audio ? (
            <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/30 py-3 cursor-pointer hover:bg-white/10 transition">
              <Music size={14} />
              Choose audio file
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
            </label>
          ) : (
            <>
              {/* File name + remove */}
              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5 min-w-0">
                <span className="truncate flex-1">{audio.name}</span>
                <button
                  className="shrink-0 p-0.5 rounded hover:text-red-400 cursor-pointer"
                  onClick={handleRemoveAudio}
                  title="Remove audio"
                >
                  <Trash size={13} />
                </button>
              </div>

              {/* Speed */}
              <div className="flex flex-col gap-1">
                <span className="text-white/60">Speed</span>
                <div className="grid grid-cols-4 gap-1 rounded-lg bg-white/10 p-1">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className={`py-1 rounded-md cursor-pointer transition ${
                        audioSpeed === s
                          ? "bg-blue-500 text-white"
                          : "hover:bg-white/10 text-white/80"
                      }`}
                      onClick={() => setAudioSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio volume (can be hidden) */}
              <div className="flex flex-col gap-1">
                <button
                  className="flex items-center justify-between text-white/60 hover:text-white cursor-pointer"
                  onClick={() => setShowVolume((v) => !v)}
                  title={showVolume ? "Hide volume" : "Show volume"}
                >
                  <span className="flex items-center gap-1.5">
                    {audioVolume === 0 ? (
                      <VolumeX size={13} />
                    ) : (
                      <Volume2 size={13} />
                    )}
                    Audio volume {Math.round(audioVolume * 100)}%
                  </span>
                  {showVolume ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronUp size={14} />
                  )}
                </button>

                {showVolume && (
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                )}
              </div>

              {/* Loop audio */}
              <button
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg cursor-pointer transition ${
                  isAudioLooping
                    ? "bg-yellow-500 text-black"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => setIsAudioLooping((p) => !p)}
              >
                <RefreshCcw size={12} />
                Loop
              </button>
            </>
          )}
        </div>
      )}

      {/* Panel toggle button */}
      <button
        className={`absolute bottom-2 left-2 z-30 h-9 w-9 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition ${
          isAudioPanelOpen
            ? "bg-blue-500 text-white"
            : "bg-black/70 text-white hover:bg-black/90"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsAudioPanelOpen((o) => !o);
        }}
        title="Audio & volume"
      >
        <Music size={16} />
        {audio && (
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-green-400" />
        )}
      </button>

      {/* Prev / Next buttons */}
      {item.media.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
            onClick={handlePrev}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
            onClick={handleNext}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Controls (when paused) */}
      {!isPlaying && item.media.length > 0 && (
        <div className="absolute inset-0 z-[5] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-[220px] rounded-2xl border border-white/10 bg-neutral-900/80 p-3 shadow-2xl flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Resume */}
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 transition py-2.5 text-sm font-semibold text-white cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <Play size={16} fill="currentColor" />
              Resume
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Randomize */}
              <button
                className="flex flex-col items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition py-2.5 text-xs text-white cursor-pointer"
                onClick={() => {
                  randomizeMedia(id);
                  setCurrentIndex(0);
                }}
              >
                <Shuffle size={16} />
                Randomize
              </button>

              {/* Loop (image / video) */}
              {media && (
                <button
                  className={`flex flex-col items-center gap-1 rounded-xl active:scale-95 transition py-2.5 text-xs cursor-pointer ${
                    isLoopActive
                      ? "bg-yellow-500 text-black"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                  onClick={() => {
                    if (media.type === "video") setIsLooping((p) => !p);
                    else setIsImageLooping((p) => !p);
                  }}
                >
                  <RefreshCcw size={16} />
                  {isLoopActive ? "Unloop" : "Loop"}
                </button>
              )}
            </div>

            {/* Remove */}
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 active:scale-95 transition py-2 text-xs cursor-pointer"
              onClick={() => {
                removeMediaFromGrid(id, currentIndex);
                setCurrentIndex(0);
              }}
            >
              <Trash size={14} />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;