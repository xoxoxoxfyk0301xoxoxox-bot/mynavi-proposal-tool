/**
 * 職種・企画別掲載案件数データ
 * マイナビ転職 2025年8月時点
 * 
 * 各職種において、最も掲載案件数が多い企画が平均以上のPVを獲得できる傾向
 */

export interface JobPlanDistribution {
  jobType: string;
  mtS: number;
  mtA: number;
  mtB: number;
  mtC: number;
  mtD: number;
  recommendedPlan: 'MT-S' | 'MT-A' | 'MT-B' | 'MT-C' | 'MT-D';
  maxCount: number;
}

export const JOB_PLAN_DISTRIBUTIONS: JobPlanDistribution[] = [
  {
    jobType: '営業',
    mtS: 445,
    mtA: 363,
    mtB: 364,
    mtC: 170,
    mtD: 310,
    recommendedPlan: 'MT-S',
    maxCount: 445,
  },
  {
    jobType: '営業ドミュニケーション',
    mtS: 157,
    mtA: 44,
    mtB: 71,
    mtC: 47,
    mtD: 68,
    recommendedPlan: 'MT-S',
    maxCount: 157,
  },
  {
    jobType: '医療・福祉',
    mtS: 18,
    mtA: 13,
    mtB: 29,
    mtC: 18,
    mtD: 30,
    recommendedPlan: 'MT-D',
    maxCount: 30,
  },
  {
    jobType: '企画・営業',
    mtS: 42,
    mtA: 33,
    mtB: 35,
    mtC: 18,
    mtD: 19,
    recommendedPlan: 'MT-S',
    maxCount: 42,
  },
  {
    jobType: '建築・土木',
    mtS: 130,
    mtA: 92,
    mtB: 150,
    mtC: 121,
    mtD: 151,
    recommendedPlan: 'MT-D',
    maxCount: 151,
  },
  {
    jobType: 'IT・エンジニア',
    mtS: 220,
    mtA: 153,
    mtB: 80,
    mtC: 26,
    mtD: 174,
    recommendedPlan: 'MT-S',
    maxCount: 220,
  },
  {
    jobType: '電気・電子・機械・半導体',
    mtS: 57,
    mtA: 87,
    mtB: 61,
    mtC: 44,
    mtD: 130,
    recommendedPlan: 'MT-D',
    maxCount: 130,
  },
  {
    jobType: '医薬・食品・化学・素材',
    mtS: 9,
    mtA: 19,
    mtB: 43,
    mtC: 22,
    mtD: 46,
    recommendedPlan: 'MT-D',
    maxCount: 46,
  },
  {
    jobType: '金融・不動産・物流・その他',
    mtS: 32,
    mtA: 52,
    mtB: 33,
    mtC: 21,
    mtD: 20,
    recommendedPlan: 'MT-A',
    maxCount: 52,
  },
  {
    jobType: 'クリエイティブ・デザイン',
    mtS: 28,
    mtA: 43,
    mtB: 54,
    mtC: 49,
    mtD: 22,
    recommendedPlan: 'MT-B',
    maxCount: 54,
  },
  {
    jobType: '公共サービス',
    mtS: 285,
    mtA: 203,
    mtB: 443,
    mtC: 305,
    mtD: 340,
    recommendedPlan: 'MT-B',
    maxCount: 443,
  },
  {
    jobType: '管理・事務',
    mtS: 6,
    mtA: 14,
    mtB: 42,
    mtC: 57,
    mtD: 49,
    recommendedPlan: 'MT-C',
    maxCount: 57,
  },
  {
    jobType: 'WEB・インターネット・ゲーム',
    mtS: 285,
    mtA: 231,
    mtB: 470,
    mtC: 254,
    mtD: 194,
    recommendedPlan: 'MT-B',
    maxCount: 470,
  },
  {
    jobType: '保育・教育・福祉',
    mtS: 69,
    mtA: 28,
    mtB: 55,
    mtC: 40,
    mtD: 54,
    recommendedPlan: 'MT-S',
    maxCount: 69,
  },
  {
    jobType: 'その他',
    mtS: 41,
    mtA: 21,
    mtB: 36,
    mtC: 16,
    mtD: 15,
    recommendedPlan: 'MT-S',
    maxCount: 41,
  },
];

/**
 * 職種から推奨企画を取得
 */
export function getRecommendedPlanByJobType(jobType: string): 'MT-S' | 'MT-A' | 'MT-B' | 'MT-C' | 'MT-D' | null {
  // 完全一致
  const exactMatch = JOB_PLAN_DISTRIBUTIONS.find(j => j.jobType === jobType);
  if (exactMatch) {
    return exactMatch.recommendedPlan;
  }

  // 部分一致
  for (const distribution of JOB_PLAN_DISTRIBUTIONS) {
    if (jobType.includes(distribution.jobType) || distribution.jobType.includes(jobType)) {
      return distribution.recommendedPlan;
    }
  }

  return null;
}

/**
 * 職種の掲載案件数データを取得
 */
export function getJobPlanDistribution(jobType: string): JobPlanDistribution | null {
  // 完全一致
  const exactMatch = JOB_PLAN_DISTRIBUTIONS.find(j => j.jobType === jobType);
  if (exactMatch) {
    return exactMatch;
  }

  // 部分一致
  for (const distribution of JOB_PLAN_DISTRIBUTIONS) {
    if (jobType.includes(distribution.jobType) || distribution.jobType.includes(jobType)) {
      return distribution;
    }
  }

  return null;
}

/**
 * 職種の掲載案件数分布を取得（パーセンテージ）
 */
export function getJobPlanDistributionPercentage(jobType: string): Record<string, number> | null {
  const distribution = getJobPlanDistribution(jobType);
  if (!distribution) return null;

  const total = distribution.mtS + distribution.mtA + distribution.mtB + distribution.mtC + distribution.mtD;

  return {
    'MT-S': (distribution.mtS / total) * 100,
    'MT-A': (distribution.mtA / total) * 100,
    'MT-B': (distribution.mtB / total) * 100,
    'MT-C': (distribution.mtC / total) * 100,
    'MT-D': (distribution.mtD / total) * 100,
  };
}
