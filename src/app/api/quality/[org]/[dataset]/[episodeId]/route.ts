import { NextResponse } from 'next/server';
import { saveEpisodeQuality, getEpisodeQuality } from '@/utils/episodeQuality';
import { EpisodeQuality } from '@/utils/episodeQuality';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ org: string; dataset: string; episodeId: string }> }
) {
  try {
    const { org, dataset, episodeId } = await params;
    const quality = getEpisodeQuality(org, dataset, parseInt(episodeId));
    return NextResponse.json(quality);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch episode quality' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ org: string; dataset: string; episodeId: string }> }
) {
  try {
    const { org, dataset, episodeId } = await params;
    const quality: EpisodeQuality = await request.json();
    
    saveEpisodeQuality(org, dataset, parseInt(episodeId), quality);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save episode quality' },
      { status: 500 }
    );
  }
} 