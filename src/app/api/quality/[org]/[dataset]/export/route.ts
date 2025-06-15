import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fetchJson, DatasetMetadata } from "@/utils/parquetUtils";
import { getAllEpisodeQualities } from "@/utils/episodeQuality";

const DATASET_URL = process.env.DATASET_URL || "https://huggingface.co/datasets";

export async function GET(
  request: Request,
  { params }: { params: { org: string; dataset: string } }
) {
  try {
    const { org, dataset } = params;
    const repoId = `${org}/${dataset}`;

    // Obtener la información del dataset
    const jsonUrl = `${DATASET_URL}/${repoId}/resolve/main/meta/info.json`;
    const info = await fetchJson<DatasetMetadata>(jsonUrl);

    // Obtener las calificaciones usando la función existente
    const qualities = getAllEpisodeQualities(org, dataset);
    
    // Filtrar los episodios buenos
    const goodEpisodes = Object.entries(qualities)
      .filter(([key, value]) => key !== 'metadata' && value.quality === 'good')
      .map(([key]) => parseInt(key))
      .sort((a, b) => a - b);

    // Crear el formato compatible con Hugging Face
    const hfFormat = {
      dataset_info: {
        name: dataset,
        organization: org,
        total_episodes: info.total_episodes,
        good_episodes: goodEpisodes.length,
        quality_ratio: goodEpisodes.length / info.total_episodes,
        export_date: new Date().toISOString()
      },
      episodes: goodEpisodes.map(episodeId => ({
        episode_id: episodeId,
        quality_info: qualities[episodeId],
        // Incluir información adicional del episodio si está disponible
        metadata: {
          frame_count: qualities[episodeId]?.metadata?.frame_count,
          duration: qualities[episodeId]?.metadata?.duration,
          error_count: qualities[episodeId]?.metadata?.error_count,
          success_rate: qualities[episodeId]?.metadata?.success_rate
        }
      }))
    };

    // Generar el contenido en formato JSON
    const content = JSON.stringify(hfFormat, null, 2);

    // Crear el archivo temporal
    const tempDir = path.join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `${org}_${dataset}_good_episodes.json`;
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, content);

    // Leer el archivo para enviarlo
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Eliminar el archivo temporal
    await fs.unlink(filePath);

    // Devolver el archivo como respuesta
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error) {
    console.error('Error exporting good episodes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export good episodes. Please check dataset access.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 