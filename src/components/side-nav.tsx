"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { EpisodeQuality } from "@/utils/episodeQuality";
import { FaDownload } from "react-icons/fa";

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
  initialQuality?: EpisodeQuality | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  datasetInfo,
  paginatedEpisodes,
  episodeId,
  totalPages,
  currentPage,
  prevPage,
  nextPage,
  initialQuality,
}) => {
  const [org, dataset] = datasetInfo.repoId.split("/");
  const [currentQuality, setCurrentQuality] = useState<EpisodeQuality | null>(initialQuality || null);
  const [episodesQuality, setEpisodesQuality] = useState<Record<number, EpisodeQuality>>({});
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [qualityNote, setQualityNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Función para cargar la calidad de un episodio específico
  const fetchEpisodeQuality = async (ep: number) => {
    try {
      const response = await fetch(`/api/quality/${org}/${dataset}/${ep}`);
      if (response.ok) {
        const quality = await response.json();
        if (quality) {
          setCurrentQuality(quality);
          setEpisodesQuality(prev => ({
            ...prev,
            [ep]: quality
          }));
          if (quality.notes) {
            setQualityNote(quality.notes);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching episode quality:', error);
    }
  };

  // Cargar la calidad del episodio actual cuando cambia
  useEffect(() => {
    if (episodeId) {
      fetchEpisodeQuality(episodeId);
    }
  }, [episodeId]);

  // Cargar las calidades de todos los episodios visibles
  useEffect(() => {
    const fetchEpisodesQuality = async () => {
      try {
        const qualities: Record<number, EpisodeQuality> = {};
        for (const ep of paginatedEpisodes) {
          // Solo cargar si no tenemos la calidad en el estado
          if (!episodesQuality[ep]) {
            const response = await fetch(`/api/quality/${org}/${dataset}/${ep}`);
            if (response.ok) {
              const quality = await response.json();
              if (quality) {
                qualities[ep] = quality;
              }
            }
          }
        }
        // Actualizar solo las nuevas calidades
        if (Object.keys(qualities).length > 0) {
          setEpisodesQuality(prev => ({
            ...prev,
            ...qualities
          }));
        }
      } catch (error) {
        console.error('Error fetching episodes quality:', error);
      }
    };
    fetchEpisodesQuality();
  }, [org, dataset, paginatedEpisodes, episodesQuality]);

  const handleQualityChange = async (quality: 'good' | 'bad') => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/quality/${org}/${dataset}/${episodeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality,
          timestamp: Date.now(),
          notes: qualityNote,
          modifiedByUser: true,
          source: 'manual'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quality rating');
      }

      // Actualizar el estado local inmediatamente
      const updatedQuality: EpisodeQuality = {
        quality,
        timestamp: Date.now(),
        notes: qualityNote,
        modifiedByUser: true,
        source: 'manual'
      };
      
      setCurrentQuality(updatedQuality);
      setEpisodesQuality(prev => ({
        ...prev,
        [episodeId]: updatedQuality
      }));

      // Recargar la calidad para asegurar sincronización
      await fetchEpisodeQuality(episodeId);
    } catch (error) {
      console.error('Error saving quality rating:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      const response = await fetch(`/api/quality/${org}/${dataset}/${episodeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentQuality,
          notes: qualityNote,
          timestamp: Date.now(),
          modifiedByUser: true,
          source: 'manual' as const,
          quality: currentQuality?.quality || 'unrated'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      // Actualizar el estado local
      const updatedQuality: EpisodeQuality = {
        ...currentQuality,
        notes: qualityNote,
        timestamp: Date.now(),
        modifiedByUser: true,
        source: 'manual' as const,
        quality: currentQuality?.quality || 'unrated'
      };
      setCurrentQuality(updatedQuality);
      setEpisodesQuality(prev => ({
        ...prev,
        [episodeId]: updatedQuality
      }));

      setShowQualityModal(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleExportGoodEpisodes = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/quality/${org}/${dataset}/export?quality=good`);
      
      if (!response.ok) {
        throw new Error('Failed to export episodes');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${org}_${dataset}_good_episodes.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting episodes:', error);
    } finally {
      setIsExporting(false);
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
            <li className="text-slate-300">
              <span className="font-medium">Dataset:</span> {datasetInfo.repoId}
            </li>
            <li className="text-slate-300">
              <span className="font-medium">Total Episodes:</span> {datasetInfo.total_episodes}
            </li>
            <li className="text-slate-300">
              <span className="font-medium">FPS:</span> {datasetInfo.fps}
            </li>
          </ul>
        </div>

        {/* Quality Section */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-200">Episode Quality</h2>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
            </button>
          </div>

          {currentQuality && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                currentQuality.quality === 'good' ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">
                    Status: {currentQuality.quality.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-400">
                    {currentQuality.source === 'auto' ? 'Auto-evaluated' : 'Manual'}
                  </span>
                </div>
                
                {showMetrics && currentQuality.metadata && (
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <div>Frame Count: {currentQuality.metadata.frame_count ?? 0}</div>
                    <div>Duration: {(currentQuality.metadata.duration ?? 0).toFixed(2)}s</div>
                    <div>Error Count: {currentQuality.metadata.error_count ?? 0}</div>
                    <div>Success Rate: {((currentQuality.metadata.success_rate ?? 0) * 100).toFixed(1)}%</div>
                    <div>Total Reward: {(currentQuality.metadata.reward_sum ?? 0).toFixed(3)}</div>
                    {currentQuality.metadata.max_reward !== undefined && (
                      <div>Max Reward: {currentQuality.metadata.max_reward.toFixed(3)}</div>
                    )}
                    {currentQuality.metadata.reward_variance !== undefined && (
                      <div>Reward Variance: {currentQuality.metadata.reward_variance.toFixed(3)}</div>
                    )}
                    <div>Criteria Met: {currentQuality.metadata.criteria_met ?? 0}/7</div>
                  </div>
                )}

                {currentQuality.notes && (
                  <div className="mt-3 text-sm text-slate-300">
                    <span className="font-medium">Notes:</span> {currentQuality.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleQualityChange('good')}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    currentQuality.quality === 'good'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } transition-colors disabled:opacity-50`}
                >
                  Good
                </button>
                <button
                  onClick={() => handleQualityChange('bad')}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    currentQuality.quality === 'bad'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } transition-colors disabled:opacity-50`}
                >
                  Bad
                </button>
                <button
                  onClick={() => setShowQualityModal(true)}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Notes
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleExportGoodEpisodes}
            disabled={isExporting}
            className="w-full px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaDownload />
            {isExporting ? 'Exporting...' : 'Export Good Episodes'}
          </button>
        </div>

        {/* Episodes List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Episodes</h2>
          <div className="space-y-2">
            {paginatedEpisodes.map((ep) => (
              <Link
                key={ep}
                href={`/${org}/${dataset}/${ep}`}
                className={`block p-2 rounded-lg transition-colors ${
                  ep === episodeId
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Episode {ep}</span>
                  {episodesQuality[ep] && (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        episodesQuality[ep].quality === 'good'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {episodesQuality[ep].quality}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

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
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Add Notes</h3>
            <textarea
              value={qualityNote}
              onChange={(e) => setQualityNote(e.target.value)}
              className="w-full h-32 p-2 rounded bg-slate-700 text-slate-200 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="Enter your notes here..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowQualityModal(false)}
                className="px-4 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors"
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
