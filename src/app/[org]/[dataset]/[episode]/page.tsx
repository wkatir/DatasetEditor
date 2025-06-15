import EpisodeViewer from "./episode-viewer";
import { getEpisodeDataSafe } from "./fetch-data";

export const dynamic = "force-dynamic";

type PageParams = {
  org: string;
  dataset: string;
  episode: string;
}

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { org, dataset, episode } = await params;
  await searchParams; // We need to await this even if we don't use it
  return {
    title: `${org}/${dataset} | episode ${episode}`,
  };
}

export default async function EpisodePage({ params, searchParams }: Props) {
  // episode is like 'episode_1'
  const { org, dataset, episode } = await params;
  await searchParams; // We need to await this even if we don't use it
  // fetchData should be updated if needed to support this path pattern
  const episodeNumber = Number(episode.replace(/^episode_/, ""));
  const { data, error } = await getEpisodeDataSafe(org, dataset, episodeNumber);
  return <EpisodeViewer data={data} error={error} />;
}
