"use client";

import Link from "next/link";
import React from "react";

interface SidebarProps {
  datasetInfo: any;
  paginatedEpisodes: any[];
  episodeId: any;
  totalPages: number;
  currentPage: number;
  prevPage: () => void;
  nextPage: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  datasetInfo,
  paginatedEpisodes,
  episodeId,
  totalPages,
  currentPage,
  prevPage,
  nextPage,
}) => {
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!sidebarVisible) return;
    function handleClickOutside(event: MouseEvent) {
      // If click is outside the sidebar nav
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setTimeout(() => setSidebarVisible(false), 500);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible]);

  return (
    <div className="flex z-10 min-h-screen absolute md:static" ref={sidebarRef}>
      <nav
        className={`shrink-0 overflow-y-auto bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-6 break-words md:max-h-screen w-72 md:shrink border-r border-slate-700/30 transition-all duration-300 ${
          !sidebarVisible ? "hidden" : ""
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Dataset Info Section */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Dataset Information</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-slate-300">
              <span className="text-sky-400">Samples/Frames:</span>
              <span className="font-mono">{datasetInfo.total_frames}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <span className="text-sky-400">Episodes:</span>
              <span className="font-mono">{datasetInfo.total_episodes}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <span className="text-sky-400">FPS:</span>
              <span className="font-mono">{datasetInfo.fps}</span>
            </li>
          </ul>
        </div>

        {/* Episodes Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Episodes</h2>
          <div className="space-y-1">
            {paginatedEpisodes.map((episode) => (
              <Link
                key={episode}
                href={`./episode_${episode}`}
                className={`block px-3 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
                  episode === episodeId
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent"
                }`}
              >
                Episode {episode}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prevPage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
                disabled={currentPage === 1}
              >
                « Previous
              </button>
              <span className="font-mono text-sm text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
                disabled={currentPage === totalPages}
              >
                Next »
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Toggle Sidebar Button */}
      <button
        className="mx-1 flex items-center opacity-50 hover:opacity-100 focus:outline-none focus:ring-0 transition-opacity duration-300"
        onClick={toggleSidebar}
        title="Toggle sidebar"
      >
        <div className="h-10 w-2 rounded-full bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 transition-all duration-300"></div>
      </button>
    </div>
  );
};

export default Sidebar;
