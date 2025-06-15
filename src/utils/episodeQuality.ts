import fs from 'fs';
import path from 'path';

export interface EpisodeQuality {
  quality: 'good' | 'bad' | 'unrated';
  notes?: string;
  timestamp: number;
  metadata?: {
    frame_count?: number;
    duration?: number;
    error_count?: number;
    success_rate?: number;
  };
}

export interface DatasetQuality {
  [episodeId: number]: EpisodeQuality;
  metadata?: {
    total_episodes: number;
    good_episodes: number;
    bad_episodes: number;
    unrated_episodes: number;
    last_updated: number;
  };
}

// Función para obtener la ruta del archivo de calidad
function getQualityFilePath(org: string, dataset: string): string {
  const dataDir = path.join(process.cwd(), 'data', 'qualities');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, `${org}_${dataset}.json`);
}

// Función para actualizar los metadatos del dataset
function updateDatasetMetadata(qualities: DatasetQuality): DatasetQuality {
  const episodes = Object.entries(qualities).filter(([key]) => key !== 'metadata');
  const goodEpisodes = episodes.filter(([_, quality]) => quality.quality === 'good').length;
  const badEpisodes = episodes.filter(([_, quality]) => quality.quality === 'bad').length;
  const unratedEpisodes = episodes.filter(([_, quality]) => quality.quality === 'unrated').length;

  return {
    ...qualities,
    metadata: {
      total_episodes: episodes.length,
      good_episodes: goodEpisodes,
      bad_episodes: badEpisodes,
      unrated_episodes: unratedEpisodes,
      last_updated: Date.now()
    }
  };
}

// Función para guardar la calificación de un episodio
export function saveEpisodeQuality(
  org: string,
  dataset: string,
  episodeId: number,
  quality: EpisodeQuality
): void {
  const filePath = getQualityFilePath(org, dataset);
  let qualities: DatasetQuality = {};
  
  // Leer el archivo existente si existe
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    qualities = JSON.parse(fileContent);
  }
  
  // Actualizar la calificación
  qualities[episodeId] = {
    ...quality,
    timestamp: Date.now()
  };
  
  // Actualizar metadatos
  qualities = updateDatasetMetadata(qualities);
  
  // Guardar el archivo
  fs.writeFileSync(filePath, JSON.stringify(qualities, null, 2));
}

// Función para obtener la calificación de un episodio
export function getEpisodeQuality(
  org: string,
  dataset: string,
  episodeId: number
): EpisodeQuality | null {
  const filePath = getQualityFilePath(org, dataset);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const qualities: DatasetQuality = JSON.parse(fileContent);
  return qualities[episodeId] || null;
}

// Función para obtener todas las calificaciones de un dataset
export function getAllEpisodeQualities(
  org: string,
  dataset: string
): DatasetQuality {
  const filePath = getQualityFilePath(org, dataset);
  
  if (!fs.existsSync(filePath)) {
    return {
      metadata: {
        total_episodes: 0,
        good_episodes: 0,
        bad_episodes: 0,
        unrated_episodes: 0,
        last_updated: Date.now()
      }
    };
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Función para filtrar episodios por calidad
export function filterEpisodesByQuality(
  episodes: number[],
  qualities: DatasetQuality,
  quality: 'good' | 'bad' | 'unrated'
): number[] {
  return episodes.filter(episodeId => {
    const episodeQuality = qualities[episodeId];
    if (!episodeQuality) return quality === 'unrated';
    return episodeQuality.quality === quality;
  });
}

// Función para obtener estadísticas del dataset
export function getDatasetStats(qualities: DatasetQuality) {
  const metadata = qualities.metadata || {
    total_episodes: 0,
    good_episodes: 0,
    bad_episodes: 0,
    unrated_episodes: 0,
    last_updated: Date.now()
  };

  return {
    total_episodes: metadata.total_episodes,
    good_episodes: metadata.good_episodes,
    bad_episodes: metadata.bad_episodes,
    unrated_episodes: metadata.unrated_episodes,
    good_ratio: metadata.total_episodes > 0 ? metadata.good_episodes / metadata.total_episodes : 0,
    bad_ratio: metadata.total_episodes > 0 ? metadata.bad_episodes / metadata.total_episodes : 0,
    last_updated: metadata.last_updated
  };
} 