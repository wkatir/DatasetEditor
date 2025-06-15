"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postParentMessageWithParams } from "@/utils/postParentMessage";
import VideosPlayer from "@/components/videos-player";
import DataRecharts from "@/components/data-recharts";
import PlaybackBar from "@/components/playback-bar";
import { TimeProvider, useTime } from "@/context/time-context";
import Sidebar from "@/components/side-nav";
import Loading from "@/components/loading-component";
import { autoEvaluateEpisode } from '@/utils/autoQualityEvaluator';
import { EpisodeQuality } from '@/utils/episodeQuality';

export default function EpisodeViewer({
  data,
  error,
}: {
  data?: any;
  error?: string;
}) {
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-red-400">
        <div className="max-w-xl p-8 rounded bg-slate-900 border border-red-500 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-lg font-mono whitespace-pre-wrap mb-4">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <TimeProvider duration={data.duration}>
      <EpisodeViewerInner data={data} />
    </TimeProvider>
  );
}

function EpisodeViewerInner({ data }: { data: any }) {
  const {
    datasetInfo,
    episodeId,
    videosInfo,
    chartDataGroups,
    episodes,
    ignoredColumns,
  } = data;

  const [videosReady, setVideosReady] = useState(!videosInfo.length);
  const [chartsReady, setChartsReady] = useState(false);
  const isLoading = !videosReady || !chartsReady;

  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  // Use context for time sync
  const { currentTime, setCurrentTime, setIsPlaying, isPlaying } = useTime();

  // Pagination state
  const pageSize = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(episodes.length / pageSize);
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Estado para la evaluación automática
  const [autoEvaluation, setAutoEvaluation] = useState<EpisodeQuality | null>(null);

  // Initialize based on URL time parameter
  useEffect(() => {
    const timeParam = searchParams.get("t");
    if (timeParam) {
      const timeValue = parseFloat(timeParam);
      if (!isNaN(timeValue)) {
        setCurrentTime(timeValue);
      }
    }
  }, []);

  // sync with parent window hf.co/spaces
  useEffect(() => {
    postParentMessageWithParams((params: URLSearchParams) => {
      params.set("path", window.location.pathname + window.location.search);
    });
  }, []);

  // Initialize based on URL time parameter and episode
  useEffect(() => {
    // Initialize page based on current episode
    const episodeIndex = episodes.indexOf(episodeId);
    if (episodeIndex !== -1) {
      setCurrentPage(Math.floor(episodeIndex / pageSize) + 1);
    }

    // Add keyboard event listener
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [episodes, episodeId, pageSize, searchParams]);

  // Only update URL ?t= param when the integer second changes
  const lastUrlSecondRef = useRef<number>(-1);
  useEffect(() => {
    if (isPlaying) return;
    const currentSec = Math.floor(currentTime);
    if (currentTime > 0 && lastUrlSecondRef.current !== currentSec) {
      lastUrlSecondRef.current = currentSec;
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("t", currentSec.toString());
      // Replace state instead of pushing to avoid navigation stack bloat
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${newParams.toString()}`,
      );
      postParentMessageWithParams((params: URLSearchParams) => {
        params.set("path", window.location.pathname + window.location.search);
      });
    }
  }, [isPlaying, currentTime, searchParams]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e;

    if (key === " ") {
      e.preventDefault();
      setIsPlaying((prev: boolean) => !prev);
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      e.preventDefault();
      const nextEpisodeId = key === "ArrowDown" ? episodeId + 1 : episodeId - 1;
      const lowestEpisodeId = episodes[0];
      const highestEpisodeId = episodes[episodes.length - 1];

      if (
        nextEpisodeId >= lowestEpisodeId &&
        nextEpisodeId <= highestEpisodeId
      ) {
        router.push(`./episode_${nextEpisodeId}`);
      }
    }
  };

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Realizar evaluación automática cuando los datos estén listos
  useEffect(() => {
    if (chartsReady && !autoEvaluation) {
      const evaluation = autoEvaluateEpisode(data);
      setAutoEvaluation(evaluation);
      
      // Solo aplicar la evaluación automática si no hay una calificación manual
      const checkAndApplyAutoEvaluation = async () => {
        try {
          const [org, dataset] = data.datasetInfo.repoId.split('/');
          const response = await fetch(`/api/quality/${org}/${dataset}/${data.episodeId}`);
          if (response.ok) {
            const currentQuality = await response.json();
            // Solo aplicar si no hay calificación o si no fue modificada por el usuario
            if (!currentQuality || !currentQuality.modifiedByUser) {
              if (evaluation.quality === 'good' || evaluation.quality === 'bad') {
                handleQualityChange(evaluation.quality);
              }
            }
          }
        } catch (error) {
          console.error('Error checking current quality:', error);
        }
      };
      
      checkAndApplyAutoEvaluation();
    }
  }, [chartsReady, data, autoEvaluation]);

  const handleQualityChange = async (quality: 'good' | 'bad') => {
    try {
      const [org, dataset] = data.datasetInfo.repoId.split('/');
      const response = await fetch(`/api/quality/${org}/${dataset}/${data.episodeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality,
          timestamp: Date.now(),
          metadata: autoEvaluation?.metadata,
          source: 'auto' // Indicar que es una calificación automática
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quality rating');
      }
    } catch (error) {
      console.error('Error saving quality rating:', error);
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-slate-950 text-gray-200">
      {/* Sidebar */}
      <Sidebar
        datasetInfo={datasetInfo}
        paginatedEpisodes={paginatedEpisodes}
        episodeId={episodeId}
        totalPages={totalPages}
        currentPage={currentPage}
        prevPage={prevPage}
        nextPage={nextPage}
        initialQuality={autoEvaluation}
      />

      {/* Content */}
      <div
        className={`flex max-h-screen flex-col gap-4 p-4 md:flex-1 relative ${isLoading ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {isLoading && <Loading />}

        <div className="flex items-center justify-start my-4">
          <a
            href="https://github.com/huggingface/lerobot"
            target="_blank"
            className="block"
          >
            <img
              src="https://github.com/huggingface/lerobot/raw/main/media/lerobot-logo-thumbnail.png"
              alt="LeRobot Logo"
              className="w-32"
            />
          </a>

          <div>
            <a
              href={`https://huggingface.co/datasets/${datasetInfo.repoId}`}
              target="_blank"
            >
              <p className="text-lg font-semibold">{datasetInfo.repoId}</p>
            </a>

            <p className="font-mono text-lg font-semibold">
              episode {episodeId}
            </p>
          </div>
        </div>

        {/* Videos */}
        {videosInfo.length && (
          <VideosPlayer
            videosInfo={videosInfo}
            onVideosReady={() => setVideosReady(true)}
          />
        )}

        {/* Graph */}
        <div className="mb-4">
          <DataRecharts
            data={chartDataGroups}
            onChartsReady={() => setChartsReady(true)}
          />

          {ignoredColumns.length > 0 && (
            <p className="mt-2 text-orange-700">
              Columns{" "}
              <span className="font-mono">{ignoredColumns.join(", ")}</span> are
              NOT shown since the visualizer currently does not support 2D or 3D
              data.
            </p>
          )}
        </div>

        <PlaybackBar />

        {/* Mostrar el resultado de la evaluación automática */}
        {autoEvaluation && (
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-4 py-2 rounded-lg ${
              autoEvaluation.quality === 'good' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
              <p className="font-bold">Auto Evaluated: {autoEvaluation.quality.toUpperCase()}</p>
              {autoEvaluation.notes && (
                <p className="text-sm mt-1">{autoEvaluation.notes}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
