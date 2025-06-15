import { EpisodeQuality } from './episodeQuality';

interface EpisodeMetrics {
  frame_count: number;
  duration: number;
  error_count: number;
  success_rate: number;
  reward_sum: number;
  done_count: number;
  average_reward: number;
  max_reward: number;
  min_reward: number;
  reward_variance: number;
}

interface QualityThresholds {
  min_success_rate: number;
  max_error_count: number;
  min_reward_sum: number;
  min_average_reward: number;
  min_duration: number;
  max_duration: number;
  min_max_reward: number;
  max_reward_variance: number;
}

// Umbrales optimizados
const DEFAULT_THRESHOLDS: QualityThresholds = {
  min_success_rate: 0.3,     // 30% de éxito mínimo
  max_error_count: 20,       // 20 errores máximos
  min_reward_sum: 0.05,      // Suma mínima de recompensas
  min_average_reward: 0.005, // Recompensa promedio mínima
  min_duration: 0.2,         // Duración mínima en segundos
  max_duration: 1200.0,      // Duración máxima (20 minutos)
  min_max_reward: 0.1,       // Recompensa máxima mínima
  max_reward_variance: 0.5   // Varianza máxima de recompensas
};

export function evaluateEpisodeQuality(
  metrics: EpisodeMetrics,
  thresholds: QualityThresholds = DEFAULT_THRESHOLDS
): EpisodeQuality {
  const {
    success_rate,
    error_count,
    reward_sum,
    average_reward,
    duration,
    max_reward,
    reward_variance
  } = metrics;

  // Evaluar cada criterio
  const isSuccessRateGood = success_rate >= thresholds.min_success_rate;
  const isErrorCountGood = error_count <= thresholds.max_error_count;
  const isRewardSumGood = reward_sum >= thresholds.min_reward_sum;
  const isAverageRewardGood = average_reward >= thresholds.min_average_reward;
  const isDurationGood = duration >= thresholds.min_duration && duration <= thresholds.max_duration;
  const isMaxRewardGood = max_reward >= thresholds.min_max_reward;
  const isRewardVarianceGood = reward_variance <= thresholds.max_reward_variance;

  // Contar criterios cumplidos
  const criteriaMet = [
    isSuccessRateGood,
    isErrorCountGood,
    isRewardSumGood,
    isAverageRewardGood,
    isDurationGood,
    isMaxRewardGood,
    isRewardVarianceGood
  ].filter(Boolean).length;

  // Determinar calidad basada en criterios cumplidos
  // Necesita cumplir al menos 3 de 7 criterios para ser "good"
  const quality: 'good' | 'bad' = criteriaMet >= 3 ? 'good' : 'bad';

  // Generar notas explicativas detalladas
  const notes = [];
  if (!isSuccessRateGood) {
    notes.push(`Success rate (${(success_rate * 100).toFixed(1)}%) below threshold (${(thresholds.min_success_rate * 100).toFixed(1)}%)`);
  }
  if (!isErrorCountGood) {
    notes.push(`Error count (${error_count}) above threshold (${thresholds.max_error_count})`);
  }
  if (!isRewardSumGood) {
    notes.push(`Total reward (${reward_sum.toFixed(2)}) below threshold (${thresholds.min_reward_sum})`);
  }
  if (!isAverageRewardGood) {
    notes.push(`Average reward (${average_reward.toFixed(3)}) below threshold (${thresholds.min_average_reward})`);
  }
  if (!isDurationGood) {
    notes.push(`Duration (${duration.toFixed(1)}s) outside acceptable range (${thresholds.min_duration}-${thresholds.max_duration}s)`);
  }
  if (!isMaxRewardGood) {
    notes.push(`Maximum reward (${max_reward.toFixed(3)}) below threshold (${thresholds.min_max_reward})`);
  }
  if (!isRewardVarianceGood) {
    notes.push(`Reward variance (${reward_variance.toFixed(3)}) above threshold (${thresholds.max_reward_variance})`);
  }

  return {
    quality,
    notes: notes.join('; '),
    timestamp: Date.now(),
    source: 'auto',
    metadata: {
      frame_count: metrics.frame_count,
      duration: metrics.duration,
      error_count: metrics.error_count,
      success_rate: metrics.success_rate,
      reward_sum: metrics.reward_sum,
      criteria_met: criteriaMet,
      max_reward: metrics.max_reward,
      reward_variance: metrics.reward_variance
    }
  };
}

export function extractMetricsFromData(data: any): EpisodeMetrics {
  const chartData = data.chartDataGroups[0] || [];
  
  // Inicializar métricas
  const metrics: EpisodeMetrics = {
    frame_count: chartData.length,
    duration: data.duration || 0,
    error_count: 0,
    success_rate: 0,
    reward_sum: 0,
    done_count: 0,
    average_reward: 0,
    max_reward: -Infinity,
    min_reward: Infinity,
    reward_variance: 0
  };

  // Variables para cálculos
  let totalRewards = 0;
  let rewardCount = 0;
  let negativeRewards = 0;
  let rewardSquaredSum = 0;

  // Procesar cada frame
  chartData.forEach((frame: any) => {
    if (frame['next.reward'] !== undefined) {
      const reward = frame['next.reward'];
      totalRewards += reward;
      rewardCount++;
      rewardSquaredSum += reward * reward;
      
      // Actualizar max/min rewards
      metrics.max_reward = Math.max(metrics.max_reward, reward);
      metrics.min_reward = Math.min(metrics.min_reward, reward);
      
      // Contar recompensas negativas como errores
      if (reward < 0) {
        negativeRewards++;
      }
    }
    
    if (frame['next.done'] === true) {
      metrics.done_count++;
    }
  });

  // Calcular métricas finales
  metrics.reward_sum = totalRewards;
  metrics.average_reward = rewardCount > 0 ? totalRewards / rewardCount : 0;
  metrics.error_count = negativeRewards;
  metrics.success_rate = metrics.done_count > 0 ? 1 : 0;

  // Calcular varianza de recompensas
  if (rewardCount > 0) {
    const mean = metrics.average_reward;
    metrics.reward_variance = (rewardSquaredSum / rewardCount) - (mean * mean);
  }

  return metrics;
}

export function autoEvaluateEpisode(
  data: any,
  thresholds?: QualityThresholds
): EpisodeQuality {
  try {
    const metrics = extractMetricsFromData(data);
    return evaluateEpisodeQuality(metrics, thresholds);
  } catch (error) {
    console.error('Error in auto evaluation:', error);
    return {
      quality: 'bad',
      notes: 'Error during automatic evaluation',
      timestamp: Date.now(),
      source: 'auto',
      metadata: {
        frame_count: 0,
        duration: 0,
        error_count: 0,
        success_rate: 0,
        reward_sum: 0,
        criteria_met: 0
      }
    };
  }
} 