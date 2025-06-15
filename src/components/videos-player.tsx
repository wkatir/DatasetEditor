"use client";

import { useEffect, useRef, useState } from "react";
import { useTime } from "../context/time-context";
import { FaExpand, FaCompress, FaTimes, FaEye } from "react-icons/fa";

type VideoInfo = {
  filename: string;
  url: string;
};

type VideoPlayerProps = {
  videosInfo: VideoInfo[];
  onVideosReady?: () => void;
};

export const VideosPlayer = ({
  videosInfo,
  onVideosReady,
}: VideoPlayerProps) => {
  const { currentTime, setCurrentTime, isPlaying, setIsPlaying } = useTime();
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  // Hidden/enlarged state and hidden menu
  const [hiddenVideos, setHiddenVideos] = useState<string[]>([]);
  // Find the index of the first visible (not hidden) video
  const firstVisibleIdx = videosInfo.findIndex(
    (video) => !hiddenVideos.includes(video.filename),
  );
  // Count of visible videos
  const visibleCount = videosInfo.filter(
    (video) => !hiddenVideos.includes(video.filename),
  ).length;
  const [enlargedVideo, setEnlargedVideo] = useState<string | null>(null);
  // Track previous hiddenVideos for comparison
  const prevHiddenVideosRef = useRef<string[]>([]);
  const videoContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const hiddenMenuRef = useRef<HTMLDivElement | null>(null);
  const showHiddenBtnRef = useRef<HTMLButtonElement | null>(null);
  const [videoCodecError, setVideoCodecError] = useState(false);

  // Initialize video refs
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videosInfo.length);
  }, [videosInfo]);

  // When videos get unhidden, start playing them if it was playing
  useEffect(() => {
    // Find which videos were just unhidden
    const prevHidden = prevHiddenVideosRef.current;
    const newlyUnhidden = prevHidden.filter(
      (filename) => !hiddenVideos.includes(filename),
    );
    if (newlyUnhidden.length > 0) {
      videosInfo.forEach((video, idx) => {
        if (newlyUnhidden.includes(video.filename)) {
          const ref = videoRefs.current[idx];
          if (ref) {
            ref.currentTime = currentTime;
            if (isPlaying) {
              ref.play().catch(() => {});
            }
          }
        }
      });
    }
    prevHiddenVideosRef.current = hiddenVideos;
  }, [hiddenVideos, isPlaying, videosInfo, currentTime]);

  // Check video codec support
  useEffect(() => {
    const checkCodecSupport = () => {
      const dummyVideo = document.createElement("video");
      const canPlayVideos = dummyVideo.canPlayType(
        'video/mp4; codecs="av01.0.05M.08"',
      );
      setVideoCodecError(!canPlayVideos);
    };

    checkCodecSupport();
  }, []);

  // Handle play/pause
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        if (isPlaying) {
          video.play().catch((e) => console.error("Error playing video:", e));
        } else {
          video.pause();
        }
      }
    });
  }, [isPlaying]);

  // Minimize enlarged video on Escape key
  useEffect(() => {
    if (!enlargedVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEnlargedVideo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // Scroll enlarged video into view
    const ref = videoContainerRefs.current[enlargedVideo];
    if (ref) {
      ref.scrollIntoView();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enlargedVideo]);

  // Close hidden videos dropdown on outside click
  useEffect(() => {
    if (!showHiddenMenu) return;
    function handleClick(e: MouseEvent) {
      const menu = hiddenMenuRef.current;
      const btn = showHiddenBtnRef.current;
      if (
        menu &&
        !menu.contains(e.target as Node) &&
        btn &&
        !btn.contains(e.target as Node)
      ) {
        setShowHiddenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showHiddenMenu]);

  // Close dropdown if no hidden videos
  useEffect(() => {
    if (hiddenVideos.length === 0 && showHiddenMenu) {
      setShowHiddenMenu(false);
    }
    // Minimize if enlarged video is hidden
    if (enlargedVideo && hiddenVideos.includes(enlargedVideo)) {
      setEnlargedVideo(null);
    }
  }, [hiddenVideos, showHiddenMenu, enlargedVideo]);

  // Sync video times
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video && Math.abs(video.currentTime - currentTime) > 0.2) {
        video.currentTime = currentTime;
      }
    });
  }, [currentTime]);

  // Handle time update
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    if (video && video.duration) {
      setCurrentTime(video.currentTime);
    }
  };

  // Handle video ready
  useEffect(() => {
    let videosReadyCount = 0;
    const onCanPlayThrough = () => {
      videosReadyCount += 1;
      if (videosReadyCount === videosInfo.length) {
        if (typeof onVideosReady === "function") {
          onVideosReady();
          setIsPlaying(true);
        }
      }
    };

    videoRefs.current.forEach((video) => {
      if (video) {
        // If already ready, call the handler immediately
        if (video.readyState >= 4) {
          onCanPlayThrough();
        } else {
          video.addEventListener("canplaythrough", onCanPlayThrough);
        }
      }
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.removeEventListener("canplaythrough", onCanPlayThrough);
        }
      });
    };
  }, []);

  return (
    <>
      {/* Error message */}
      {videoCodecError && (
        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-200 space-y-3">
          <p className="font-medium">
            Videos could NOT play because{" "}
            <a
              href="https://en.wikipedia.org/wiki/AV1"
              target="_blank"
              className="text-orange-300 hover:text-orange-200 underline transition-colors"
            >
              AV1
            </a>{" "}
            decoding is not available on your browser.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>
                If iPhone:{" "}
                <span className="italic text-orange-300">
                  It is supported with A17 chip or higher.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>
                If Mac with Safari:{" "}
                <span className="italic text-orange-300">
                  It is supported on most browsers except Safari with M1 chip or
                  higher and on Safari with M3 chip or higher.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>
                Other:{" "}
                <span className="italic text-orange-300">
                  Contact the maintainers on LeRobot discord channel:
                </span>
                <a
                  href="https://discord.com/invite/s3KuuzsPFb"
                  target="_blank"
                  className="text-orange-300 hover:text-orange-200 underline transition-colors ml-1"
                >
                  https://discord.com/invite/s3KuuzsPFb
                </a>
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Show Hidden Videos Button */}
      {hiddenVideos.length > 0 && (
        <div className="relative">
          <button
            ref={showHiddenBtnRef}
            className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 hover:text-white border border-slate-700/30 transition-all duration-300"
            onClick={() => setShowHiddenMenu((prev) => !prev)}
          >
            <FaEye className="text-sky-400" /> Show Hidden Videos ({hiddenVideos.length})
          </button>

          {/* Hidden Videos Menu */}
          {showHiddenMenu && (
            <div
              ref={hiddenMenuRef}
              className="absolute top-full left-0 mt-2 w-64 rounded-lg bg-slate-800/95 backdrop-blur-xl border border-slate-700/30 shadow-xl z-50"
            >
              <div className="p-3">
                <div className="text-sm font-medium text-slate-200 mb-2">Hidden Videos</div>
                <div className="space-y-1">
                  {hiddenVideos.map((filename) => (
                    <button
                      key={filename}
                      onClick={() => {
                        setHiddenVideos((prev) =>
                          prev.filter((f) => f !== filename),
                        );
                        setShowHiddenMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
                    >
                      {filename}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {videosInfo.map((video, idx) => {
          if (hiddenVideos.includes(video.filename)) return null;
          const isEnlarged = enlargedVideo === video.filename;
          return (
            <div
              key={video.filename}
              ref={(el) => {
                if (el) videoContainerRefs.current[video.filename] = el;
              }}
              className={`relative rounded-lg overflow-hidden border border-slate-700/30 transition-all duration-300 ${
                isEnlarged
                  ? "md:col-span-2 lg:col-span-3"
                  : "hover:border-sky-500/30"
              }`}
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current[idx] = el;
                }}
                src={video.url}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain bg-black"
                playsInline
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => {
                    if (isEnlarged) {
                      setEnlargedVideo(null);
                    } else {
                      setEnlargedVideo(video.filename);
                    }
                  }}
                  className="p-2 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white transition-all duration-300"
                >
                  {isEnlarged ? <FaCompress /> : <FaExpand />}
                </button>
                <button
                  onClick={() => {
                    setHiddenVideos((prev) => [...prev, video.filename]);
                  }}
                  className="p-2 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white transition-all duration-300"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-sm text-white font-mono truncate">
                  {video.filename}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VideosPlayer;
