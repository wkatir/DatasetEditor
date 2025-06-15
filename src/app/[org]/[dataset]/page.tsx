import { redirect } from "next/navigation";

type PageParams = {
  org: string;
  dataset: string;
}

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}

export default async function DatasetRootPage({ params, searchParams }: Props) {
  const { org, dataset } = await params;
  await searchParams; // We need to await this even if we don't use it
  
  const episodeN = process.env.EPISODES
    ?.split(/\s+/)
    .map((x) => parseInt(x.trim(), 10))
    .filter((x) => !isNaN(x))[0] ?? 0;

  redirect(`/${org}/${dataset}/episode_${episodeN}`);
}
