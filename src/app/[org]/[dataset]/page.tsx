import { redirect } from "next/navigation";
import { getAllEpisodeQualities, filterEpisodesByQuality } from "@/utils/episodeQuality";

type Props = {
  params: Promise<{ org: string; dataset: string }>;
  searchParams: Promise<{ quality?: string }>;
};

export default async function DatasetRootPage({ params, searchParams }: Props) {
  const { org, dataset } = await params;
  const { quality } = await searchParams;
  
  // Obtener todas las calificaciones del dataset
  const qualities = getAllEpisodeQualities(org, dataset);
  
  // Obtener todos los episodios disponibles
  const allEpisodes = process.env.EPISODES
    ?.split(/\s+/)
    .map((x) => parseInt(x.trim(), 10))
    .filter((x) => !isNaN(x)) || [];
  
  // Filtrar episodios por calidad si se especifica
  const filteredEpisodes = quality
    ? filterEpisodesByQuality(allEpisodes, qualities, quality as 'good' | 'bad' | 'unrated')
    : allEpisodes;
  
  // Redirigir al primer episodio disponible
  const firstEpisode = filteredEpisodes[0] ?? 0;
  redirect(`/${org}/${dataset}/episode_${firstEpisode}${quality ? `?quality=${quality}` : ''}`);
}
