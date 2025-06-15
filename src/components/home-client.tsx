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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 to-black">
      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen w-full flex flex-col lg:flex-row">
        {/* Left Side - Text Content */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:h-screen flex flex-col items-center justify-center px-4 sm:px-8 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/30">
          <div className="w-full max-w-xl py-8 lg:py-0 space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                LeRobot Dataset Visualizer
              </h1>
              <a
                href="https://x.com/RemiCadene/status/1825455895561859185"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 font-medium text-sm sm:text-base lg:text-lg hover:text-sky-300 transition-colors inline-flex items-center gap-2 group"
              >
                <span className="relative">
                  create & train your own robots
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </span>
              </a>
            </div>

            <form onSubmit={handleGo} className="flex flex-col sm:flex-row gap-2 justify-center w-full">
              <div className="relative flex-grow">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter dataset id"
                  className="w-full px-4 py-3 rounded-lg text-sm sm:text-base text-white border border-slate-600/50 focus:border-sky-400 focus:outline-none shadow-lg bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGo(e as any);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold text-sm sm:text-base hover:from-sky-400 hover:to-sky-500 transition-all duration-300 shadow-lg hover:shadow-sky-500/20 whitespace-nowrap"
              >
                Go
              </button>
            </form>

            {/* Example Datasets */}
            <div className="space-y-3">
              <div className="font-semibold text-sm sm:text-base lg:text-lg text-slate-300">Example Datasets:</div>
              <div className="flex flex-col gap-2">
                {[
                  "lerobot/aloha_static_cups_open",
                  "lerobot/columbia_cairlab_pusht_real",
                  "lerobot/taco_play",
                ].map((ds) => (
                  <button
                    key={ds}
                    type="button"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 text-sky-200 hover:bg-slate-700/80 hover:text-white transition-all duration-300 shadow-md hover:shadow-sky-500/10 backdrop-blur-sm text-xs sm:text-sm lg:text-base truncate border border-slate-700/30 hover:border-sky-500/30"
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
              className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:from-sky-400 hover:to-sky-500 transition-all duration-300 text-center hover:shadow-sky-500/20"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 to-transparent lg:hidden" />
        </div>
      </div>
    </div>
  );
} 