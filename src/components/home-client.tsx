"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube IFrame API if not already present
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    let interval: NodeJS.Timeout;
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("yt-bg-player", {
        videoId: "Er8SPJsIYr0",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          rel: 0,
          loop: 1,
          fs: 0,
          playlist: "Er8SPJsIYr0",
          start: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            event.target.mute();
            interval = setInterval(() => {
              const t = event.target.getCurrentTime();
              if (t >= 60) {
                event.target.seekTo(0);
              }
            }, 500);
          },
        },
      });
    };
    return () => {
      if (interval) clearInterval(interval);
      if (playerRef.current && playerRef.current.destroy)
        playerRef.current.destroy();
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) {
      router.push(value);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen w-full flex flex-col lg:flex-row">
        {/* Left Side - Text Content */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:h-screen flex flex-col items-center justify-center px-4 sm:px-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md">
          <div className="w-full max-w-xl py-8 lg:py-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 drop-shadow-lg text-center">
              LeRobot Dataset Visualizer
            </h1>
            <a
              href="https://x.com/RemiCadene/status/1825455895561859185"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 font-medium text-sm sm:text-base lg:text-lg underline mb-4 sm:mb-6 lg:mb-8 inline-block hover:text-sky-300 transition-colors"
            >
              create & train your own robots
            </a>
            <form onSubmit={handleGo} className="flex flex-col sm:flex-row gap-2 justify-center mt-4 sm:mt-6 w-full">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter dataset id"
                className="px-4 py-2 rounded-md text-sm sm:text-base text-white border-white border-1 focus:outline-none w-full shadow-md bg-black/30 backdrop-blur-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGo(e as any);
                  }
                }}
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-sky-400 text-black font-semibold text-sm sm:text-base hover:bg-sky-300 transition-colors shadow-md whitespace-nowrap"
              >
                Go
              </button>
            </form>

            {/* Example Datasets */}
            <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
              <div className="font-semibold mb-2 text-sm sm:text-base lg:text-lg">Example Datasets:</div>
              <div className="flex flex-col gap-2">
                {[
                  "lerobot/aloha_static_cups_open",
                  "lerobot/columbia_cairlab_pusht_real",
                  "lerobot/taco_play",
                ].map((ds) => (
                  <button
                    key={ds}
                    type="button"
                    className="w-full px-3 sm:px-4 py-2 rounded bg-slate-700/80 text-sky-200 hover:bg-sky-700 hover:text-white transition-colors shadow backdrop-blur-sm text-xs sm:text-sm lg:text-base truncate"
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = ds;
                        inputRef.current.focus();
                      }
                      router.push(ds);
                    }}
                  >
                    {ds}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/explore"
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 mt-4 sm:mt-6 lg:mt-8 rounded-md bg-sky-500 text-white font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:bg-sky-400 transition-colors w-full text-center"
            >
              Explore Open Datasets
            </Link>
          </div>
        </div>

        {/* Right Side - Video */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen relative">
          <div className="video-background">
            <div id="yt-bg-player" className="w-full h-full" />
          </div>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>
    </div>
  );
} 