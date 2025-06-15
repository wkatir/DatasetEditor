"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { EpisodeQuality } from "@/utils/episodeQuality";

interface SidebarProps {
  datasetInfo: {
    repoId: string;
    total_frames: number;
    total_episodes: number;
    fps: number;
  };
  paginatedEpisodes: number[];
  episodeId: number;
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
  const [org, dataset] = datasetInfo.repoId.split("/");
  const [currentQuality, setCurrentQuality] = useState<EpisodeQuality | null>(null);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [qualityNote, setQualityNote] = useState("");
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar la calidad del episodio actual
    const fetchQuality = async () => {
      try {
        const response = await fetch(`/api/quality/${org}/${dataset}/${episodeId}`);
        if (response.ok) {
          const quality = await response.json();
          setCurrentQuality(quality);
          if (quality?.notes) {
            setQualityNote(quality.notes);
          }
        }
      } catch (error) {
        console.error('Error fetching episode quality:', error);
      }
    };
    fetchQuality();
  }, [org, dataset, episodeId]);

  const handleQualityChange = async (quality: 'good' | 'bad') => {
    try {
      const newQuality: EpisodeQuality = {
        quality,
        notes: qualityNote,
        timestamp: Date.now()
      };

      const response = await fetch(`/api/quality/${org}/${dataset}/${episodeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuality),
      });

      if (response.ok) {
        setCurrentQuality(newQuality);
        setShowQualityModal(false);
      } else {
        console.error('Error saving episode quality');
      }
    } catch (error) {
      console.error('Error saving episode quality:', error);
    }
  };

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

        {/* Quality Control Section */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Episode Quality</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleQualityChange('good')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                currentQuality?.quality === 'good'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-green-600 hover:text-white'
              } transition-colors`}
            >
              Good
            </button>
            <button
              onClick={() => handleQualityChange('bad')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                currentQuality?.quality === 'bad'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white'
              } transition-colors`}
            >
              Bad
            </button>
          </div>
          <button
            onClick={() => setShowQualityModal(true)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Add Notes
          </button>
        </div>

        {/* Episodes Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Episodes</h2>
          <div className="space-y-2">
            {paginatedEpisodes.map((ep) => (
              <button
                key={ep}
                onClick={() => router.push(`./episode_${ep}`)}
                className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                  ep === episodeId
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Episode {ep}
              </button>
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Next
            </button>
          </div>
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

      {/* Quality Notes Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold text-white mb-4">Add Quality Notes</h3>
            <textarea
              value={qualityNote}
              onChange={(e) => setQualityNote(e.target.value)}
              className="w-full h-32 px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-sky-400 focus:outline-none"
              placeholder="Enter notes about this episode's quality..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowQualityModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentQuality?.quality === 'good' || currentQuality?.quality === 'bad') {
                    handleQualityChange(currentQuality.quality);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
