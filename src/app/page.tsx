import { redirect } from "next/navigation";
import HomeClient from "../components/home-client";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Redirect to the first episode of the dataset if REPO_ID is defined
  if (process.env.REPO_ID) {
    const episodeN = process.env.EPISODES
      ?.split(/\s+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x))[0] ?? 0;

    redirect(`/${process.env.REPO_ID}/episode_${episodeN}`);
  }
  // sync with hf.co/spaces URL params
  if (typeof params.path === 'string') {
    redirect(params.path);
  }

  // legacy sync with hf.co/spaces URL params
  let redirectUrl: string | null = null;
  if (params?.dataset && params?.episode) {
    redirectUrl = `/${params.dataset}/episode_${params.episode}`;
  } else if (params?.dataset) {
    redirectUrl = `/${params.dataset}`;
  }

  if (redirectUrl && params?.t) {
    redirectUrl += `?t=${params.t}`;
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return <HomeClient />;
}
