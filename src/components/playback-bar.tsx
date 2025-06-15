import React from "react";
import { useTime } from "../context/time-context";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaUndoAlt,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

import { debounce } from "@/utils/debounce";

const PlaybackBar: React.FC = () => {
  const { duration, isPlaying, setIsPlaying, currentTime, setCurrentTime } =
    useTime();

  const sliderActiveRef = React.useRef(false);
  const wasPlayingRef = React.useRef(false);
  const [sliderValue, setSliderValue] = React.useState(currentTime);

  // Only update sliderValue from context if not dragging
  React.useEffect(() => {
    if (!sliderActiveRef.current) {
      setSliderValue(currentTime);
    }
  }, [currentTime]);

  const updateTime = debounce((t: number) => {
    setCurrentTime(t);
  }, 200);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setSliderValue(t);
    updateTime(t);
  };

  const handleSliderMouseDown = () => {
    sliderActiveRef.current = true;
    wasPlayingRef.current = isPlaying;
    setIsPlaying(false);
  };

  const handleSliderMouseUp = () => {
    sliderActiveRef.current = false;
    setCurrentTime(sliderValue); // Snap to final value
    if (wasPlayingRef.current) {
      setIsPlaying(true);
    }
    // If it was paused before, keep it paused
  };

  return (
    <div className="flex items-center gap-4 w-full max-w-4xl mx-auto sticky bottom-4 bg-slate-900/95 backdrop-blur-xl px-6 py-4 rounded-2xl mt-auto border border-slate-700/30 shadow-xl">
      <div className="flex items-center gap-3">
        <button
          title="Jump backward 5 seconds"
          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300 hidden md:flex"
        >
          <FaBackward size={20} />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-300 ${
            isPlaying 
              ? "text-slate-400 scale-90" 
              : "text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 scale-110"
          }`}
          title="Play. Toggle with Space"
          onClick={() => setIsPlaying(true)}
          style={{ display: isPlaying ? "none" : "inline-block" }}
        >
          <FaPlay size={24} />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-300 ${
            !isPlaying 
              ? "text-slate-400 scale-90" 
              : "text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 scale-110"
          }`}
          title="Pause. Toggle with Space"
          onClick={() => setIsPlaying(false)}
          style={{ display: !isPlaying ? "none" : "inline-block" }}
        >
          <FaPause size={24} />
        </button>
        <button
          title="Jump forward 5 seconds"
          onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300 hidden md:flex"
        >
          <FaForward size={20} />
        </button>
        <button
          title="Rewind from start"
          onClick={() => setCurrentTime(0)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300 hidden md:flex"
        >
          <FaUndoAlt size={20} />
        </button>
      </div>

      <div className="flex-1 flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          onTouchStart={handleSliderMouseDown}
          onTouchEnd={handleSliderMouseUp}
          className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none focus:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:hover:bg-sky-400 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-300"
          aria-label="Seek video"
        />
        <span className="w-20 text-right tabular-nums text-sm font-mono text-slate-300 shrink-0">
          {Math.floor(sliderValue)} / {Math.floor(duration)}
        </span>
      </div>

      <div className="text-xs text-slate-300 select-none ml-8 flex-col gap-y-1 hidden md:flex">
        <p className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg border border-slate-700/50 bg-slate-800/50 text-slate-200 text-xs font-mono">
            Space
          </span>
          <span>to pause/unpause</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-700/50 bg-slate-800/50 text-slate-200 text-xs">
            <FaArrowUp size={12} />/<FaArrowDown size={12} />
          </span>
          <span>to previous/next episode</span>
        </p>
      </div>
    </div>
  );
};

export default PlaybackBar;
