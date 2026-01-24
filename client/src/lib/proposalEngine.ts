import { CampaignData } from './pricingData';
import { getIndustryDifficultyModifier, getOccupationDifficultyModifier, estimateIndustryFromWebsite, OCCUPATIONS } from './masterData';
import { calculateLocationAndJobTypeBias } from './difficultyBiasData';
import { getRecommendedPlanByJobType, getJobPlanDistributionPercentage } from './jobPlanDistribution';

export interface ProposalInput {
  companyName: string;
  homepage: string;
  jobType: string;
  location: string;
  hiringCount: number;
  targetAudience: string;
  desiredHiringPeriod: string;
  budget: number;
}

export interface PlanOption {
  name: string;
  price: number;
  description: string;
}

export interface ProposalOutput {
  plan: PlanOption;
  options: PlanOption[];
  ticketPlans: {
    twoWeeks: { price: number; discountedPrice: number; discount: number };
    threeWeeks: { price: number; discountedPrice: number; discount: number };
    sixWeeks: { price: number; discountedPrice: number; discount: number };
    twelveWeeks: { price: number; discountedPrice: number; discount: number };
  };
  totalPrice: number;
  totalPriceWithTax: number;
  difficultyScore: number;
  difficultyBreakdown: {
    targetAudienceDifficulty: number;
    hiringCountDifficulty: number;
    jobTypeDifficulty: number;
    dateUrgencyDifficulty: number;
  };
  selectionReason: string;
  appliedCampaigns: CampaignData[];
}

// 難易度スコア計算用の定数
const TARGET_AUDIENCE_DIFFICULTY: Record<string, number> = {
  '新卒': 1.0,
  '第二新卒': 1.5,
  '一般転職': 2.0,
  '管理職': 3.0,
  'スペシャリスト': 5.0,
};

const JOB_TYPE_DIFFICULTY: Record<string, number> = {
  'エンジニア': 4.5,
  '営業': 2.0,
  '企画': 3.0,
  '管理': 2.5,
  'その他': 2.0,
};

// 基本企画の料金（万円）
const BASE_PLANS = {
  'MT-S': { price: 210, description: '最上位プラン - 検索結果トップ掲載' },
  'MT-A': { price: 135, description: 'プレミアムプラン - 検索結果上位掲載' },
  'MT-B': { price: 87.5, description: 'スタンダードプラン - 検索結果中位掲載' },
  'MT-C': { price: 60, description: 'ベーシックプラン - 検索結果掲載' },
  'MT-D': { price: 36, description: 'エコノミープラン - 掲載' },
};

// オプション料金（万円）
const OPTIONS = {
  'スカウト機能': { price: 50, description: 'スカウト機能を追加' },
  'プレミアムスカウト': { price: 80, description: 'プレミアムスカウト機能を追加' },
  'プラチナオプション': { price: 150, description: 'プラチナオプション' },
  'プラチナプラス': { price: 200, description: 'プラチナプラス' },
  '検索トップリザーブシート': { price: 100, description: '検索トップリザーブシート' },
  '露出強化': { price: 60, description: '露出強化オプション' },
};

// チケット料金（万円）
const TICKET_PRICES: Record<string, TicketPricingData> = {
  'MT-S': { plan: 'MT-S', twoWeeks: 210, threeWeeks: 300, sixWeeks: 540, twelveWeeks: 900 },
  'MT-A': { plan: 'MT-A', twoWeeks: 135, threeWeeks: 190, sixWeeks: 330, twelveWeeks: 570 },
  'MT-B': { plan: 'MT-B', twoWeeks: 87.5, threeWeeks: 115, sixWeeks: 210, twelveWeeks: 360 },
  'MT-C': { plan: 'MT-C', twoWeeks: 60, threeWeeks: 80, sixWeeks: 150, twelveWeeks: 240 },
  'MT-D': { plan: 'MT-D', twoWeeks: 36, threeWeeks: 51, sixWeeks: 90, twelveWeeks: 150 },
};

export interface TicketPricingData {
  plan: string;
  twoWeeks: number;
  threeWeeks: number;
  sixWeeks: number;
  twelveWeeks: number;
}

/**
 * 難易度スコアを計算
 */
function calculateDifficultyScore(input: ProposalInput) {
  const targetAudienceDifficulty = TARGET_AUDIENCE_DIFFICULTY[input.targetAudience] || 2.0;
  
  let hiringCountDifficulty = 1.0;
  if (input.hiringCount >= 50) hiringCountDifficulty = 4.0;
  else if (input.hiringCount >= 20) hiringCountDifficulty = 3.0;
  else if (input.hiringCount >= 10) hiringCountDifficulty = 2.0;
  else if (input.hiringCount >= 5) hiringCountDifficulty = 1.5;

  // 職種と勤務地から難易度バイアスを取得
  const { jobTypeBias, locationBias, combinedBias } = calculateLocationAndJobTypeBias(input.jobType, input.location);
  
  // 職種から難易度を取得
  const occupationId = OCCUPATIONS.find(occ => occ.label === input.jobType)?.id || 'other';
  const occupationModifier = getOccupationDifficultyModifier(occupationId);
  const jobTypeDifficulty = (JOB_TYPE_DIFFICULTY[input.jobType] || 2.0) * occupationModifier * jobTypeBias;

  let dateUrgencyDifficulty = 1.0;
  const today = new Date();
  const hiringDate = new Date(input.desiredHiringPeriod);
  const daysUntilHiring = Math.floor((hiringDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilHiring <= 30) dateUrgencyDifficulty = 4.0;
  else if (daysUntilHiring <= 60) dateUrgencyDifficulty = 3.0;
  else if (daysUntilHiring <= 90) dateUrgencyDifficulty = 2.0;
  else dateUrgencyDifficulty = 1.0;

  // ホームページから業種を推定し、難易度を調整
  let industryModifier = 1.0;
  if (input.homepage) {
    const estimatedIndustry = estimateIndustryFromWebsite(input.homepage);
    if (estimatedIndustry) {
      industryModifier = getIndustryDifficultyModifier(estimatedIndustry);
    }
  }

  let totalScore = (targetAudienceDifficulty + hiringCountDifficulty + jobTypeDifficulty + dateUrgencyDifficulty) / 4;
  totalScore *= industryModifier;
  totalScore *= locationBias;  // 勤務地による難易度調整を追加

  return {
    score: Math.min(5, Math.max(0, totalScore)),
    breakdown: {
      targetAudienceDifficulty,
      hiringCountDifficulty,
      jobTypeDifficulty,
      dateUrgencyDifficulty,
    },
  };
}

/**
 * 難易度スコアと職種別掲載案件数に基づいて最適な企画を選択
 */
function selectPlan(difficultyScore: number, budget: number, jobType: string): string {
  // 職種から推奨企画を取得
  const recommendedByJobType = getRecommendedPlanByJobType(jobType);
  
  // 予算とスコアの両方を考慮して企画を選択
  let selectedPlan: string;
  if (difficultyScore >= 4.0) {
    selectedPlan = budget >= 210 ? 'MT-S' : budget >= 135 ? 'MT-A' : 'MT-B';
  } else if (difficultyScore >= 3.0) {
    selectedPlan = budget >= 135 ? 'MT-A' : budget >= 87.5 ? 'MT-B' : 'MT-C';
  } else if (difficultyScore >= 2.0) {
    selectedPlan = budget >= 87.5 ? 'MT-B' : budget >= 60 ? 'MT-C' : 'MT-D';
  } else {
    selectedPlan = budget >= 60 ? 'MT-C' : 'MT-D';
  }
  
  // 職種別掲載案件数からの推奨が予算許可範囲内で企画を調整
  if (recommendedByJobType) {
    const PLAN_PRIORITY = ['MT-S', 'MT-A', 'MT-B', 'MT-C', 'MT-D'];
    const selectedIndex = PLAN_PRIORITY.indexOf(selectedPlan);
    const recommendedIndex = PLAN_PRIORITY.indexOf(recommendedByJobType);
    
    // 職種別推奨が選択された企画より上位であれば、推奨企画を優先
    if (recommendedIndex <= selectedIndex) {
      selectedPlan = recommendedByJobType;
    }
  }
  
  return selectedPlan;
}

/**
 * 適用可能なキャンペーンを取得
 */
function getApplicableCampaigns(campaigns: CampaignData[], plan: string): CampaignData[] {
  return campaigns.filter(campaign => {
    if (!campaign.isActive) return false;
    if (campaign.applicablePlans.length === 0) return true;
    return campaign.applicablePlans.includes(plan);
  });
}

/**
 * 推奨オプションを選択
 */
function selectOptions(plan: string, difficultyScore: number, budget: number): string[] {
  const selectedOptions: string[] = [];
  let remainingBudget = budget;

  // 基本企画の料金を差し引く
  const planPrice = BASE_PLANS[plan as keyof typeof BASE_PLANS].price;
  remainingBudget -= planPrice;

  // MT-Sの場合、プラチナオプションを追加
  if (plan === 'MT-S') {
    if (remainingBudget >= OPTIONS['プラチナオプション'].price) {
      selectedOptions.push('プラチナオプション');
      remainingBudget -= OPTIONS['プラチナオプション'].price;
    }
    if (remainingBudget >= OPTIONS['プラチナプラス'].price) {
      selectedOptions.push('プラチナプラス');
      remainingBudget -= OPTIONS['プラチナプラス'].price;
    }
    if (remainingBudget >= OPTIONS['検索トップリザーブシート'].price) {
      selectedOptions.push('検索トップリザーブシート');
      remainingBudget -= OPTIONS['検索トップリザーブシート'].price;
    }
  }

  // 難易度が高い場合はスカウト機能を追加
  if (difficultyScore >= 3.5) {
    if (remainingBudget >= OPTIONS['プレミアムスカウト'].price) {
      selectedOptions.push('プレミアムスカウト');
      remainingBudget -= OPTIONS['プレミアムスカウト'].price;
    } else if (remainingBudget >= OPTIONS['スカウト機能'].price) {
      selectedOptions.push('スカウト機能');
      remainingBudget -= OPTIONS['スカウト機能'].price;
    }
  } else if (difficultyScore >= 2.5) {
    if (remainingBudget >= OPTIONS['スカウト機能'].price) {
      selectedOptions.push('スカウト機能');
      remainingBudget -= OPTIONS['スカウト機能'].price;
    }
  }

  // 露出強化オプション
  if (difficultyScore >= 2.0 && remainingBudget >= OPTIONS['露出強化'].price) {
    selectedOptions.push('露出強化');
  }

  return selectedOptions;
}

/**
 * キャンペーンを適用して割引を計算
 */
function applyDiscount(price: number, campaigns: CampaignData[]): { discountedPrice: number; discount: number } {
  let totalDiscount = 0;

  for (const campaign of campaigns) {
    if (campaign.discountType === 'percentage') {
      totalDiscount += (price * campaign.discountValue) / 100;
    } else {
      totalDiscount += campaign.discountValue;
    }
  }

  const discountedPrice = Math.max(0, price - totalDiscount);
  return { discountedPrice, discount: totalDiscount };
}

/**
 * 提案を生成
 */
export function generateProposal(input: ProposalInput): ProposalOutput {
  // 難易度スコアを計算
  const { score: difficultyScore, breakdown: difficultyBreakdown } = calculateDifficultyScore(input);

  // 最適な企画を選択
  const selectedPlan = selectPlan(difficultyScore, input.budget, input.jobType);

  // 推奨オプションを選択
  const selectedOptions = selectOptions(selectedPlan, difficultyScore, input.budget);

  // ローカルストレージからキャンペーンデータを取得
  const storedCampaigns = localStorage.getItem('adminCampaignData');
  const campaigns: CampaignData[] = storedCampaigns ? JSON.parse(storedCampaigns) : [];
  const applicableCampaigns = getApplicableCampaigns(campaigns, selectedPlan);

  // 基本企画の料金
  const basePlanPrice = BASE_PLANS[selectedPlan as keyof typeof BASE_PLANS].price;

  // オプションの合計料金
  const optionsTotalPrice = selectedOptions.reduce((sum, opt) => {
    return sum + (OPTIONS[opt as keyof typeof OPTIONS]?.price || 0);
  }, 0);

  // 合計料金
  const totalPrice = basePlanPrice + optionsTotalPrice;

  // キャンペーンを適用
  const { discountedPrice, discount: totalDiscount } = applyDiscount(totalPrice, applicableCampaigns);
  const totalPriceWithTax = Math.round(discountedPrice * 1.1 * 100) / 100;

  // チケット料金を計算
  const ticketData = TICKET_PRICES[selectedPlan];
  const { discountedPrice: twoWeeksDiscounted, discount: twoWeeksDiscount } = applyDiscount(ticketData.twoWeeks, applicableCampaigns);
  const { discountedPrice: threeWeeksDiscounted, discount: threeWeeksDiscount } = applyDiscount(ticketData.threeWeeks, applicableCampaigns);
  const { discountedPrice: sixWeeksDiscounted, discount: sixWeeksDiscount } = applyDiscount(ticketData.sixWeeks, applicableCampaigns);
  const { discountedPrice: twelveWeeksDiscounted, discount: twelveWeeksDiscount } = applyDiscount(ticketData.twelveWeeks, applicableCampaigns);

  const ticketPlans = {
    twoWeeks: { price: ticketData.twoWeeks, discountedPrice: twoWeeksDiscounted, discount: twoWeeksDiscount },
    threeWeeks: { price: ticketData.threeWeeks, discountedPrice: threeWeeksDiscounted, discount: threeWeeksDiscount },
    sixWeeks: { price: ticketData.sixWeeks, discountedPrice: sixWeeksDiscounted, discount: sixWeeksDiscount },
    twelveWeeks: { price: ticketData.twelveWeeks, discountedPrice: twelveWeeksDiscounted, discount: twelveWeeksDiscount },
  };

  return {
    plan: {
      name: selectedPlan,
      price: basePlanPrice,
      description: BASE_PLANS[selectedPlan as keyof typeof BASE_PLANS].description,
    },
    options: selectedOptions.map(opt => ({
      name: opt,
      price: OPTIONS[opt as keyof typeof OPTIONS]?.price || 0,
      description: OPTIONS[opt as keyof typeof OPTIONS]?.description || '',
    })),
    ticketPlans,
    totalPrice: discountedPrice,
    totalPriceWithTax,
    difficultyScore,
    difficultyBreakdown,
    selectionReason: generateSelectionReason(selectedPlan, difficultyScore, input),
    appliedCampaigns: applicableCampaigns,
  };
}

function generateSelectionReason(plan: string, score: number, input: ProposalInput): string {
  let reason = '';
  
  if (score >= 4.0) {
    reason = `採用難易度が非常に高い（スコア: ${score.toFixed(1)}/5）ため、${plan}をお勧めします。`;
  } else if (score >= 3.0) {
    reason = `採用難易度が高い（スコア: ${score.toFixed(1)}/5）ため、${plan}をお勧めします。`;
  } else if (score >= 2.0) {
    reason = `採用難易度が中程度（スコア: ${score.toFixed(1)}/5）のため、${plan}をお勧めします。`;
  } else {
    reason = `採用難易度が低い（スコア: ${score.toFixed(1)}/5）のため、${plan}をお勧めします。`;
  }

  // 難易度が高い場合、チケット提案を推奨
  if (score >= 3.0) {
    reason += '\n\n難易度が高いため、長期掲載プラン（チケット）の利用も検討してください。複数クール掲載することで、より多くの候補者にリーチできます。';
  }

  return reason;
}
