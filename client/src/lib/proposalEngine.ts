/**
 * マイナビ転職 提案自動化エンジン
 * 入力情報から最適な提案内容を自動生成する
 */

export interface ProposalInput {
  companyName: string;
  homepage: string;
  jobType: string;
  location: string;
  hiringCount: number;
  targetAudience: string;
  desiredHiringPeriod: string;
  budget: number; // 万円
}

export interface PlanOption {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface TicketPlan {
  id: string;
  name: string;
  period: string;
  price: number;
  savingsPercentage: number;
}

export interface ProposalOutput {
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    searchRank: string;
  };
  ticketPlans: TicketPlan[];
  options: PlanOption[];
  pricing: {
    basePlan: number;
    optionsTotal: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  reasoning: {
    difficultyScore: number;
    difficultyBreakdown: {
      target: number;
      count: number;
      jobType: number;
      period: number;
    };
    selectedReason: string;
    optionReasons: string[];
    ticketRecommendation: string;
  };
}

// チケット料金表
const TICKET_PLANS: Record<string, Record<number, number>> = {
  'MT-S': {
    2: 2100000,
    3: 3000000,
    6: 5400000,
    12: 9000000,
  },
  'MT-A': {
    2: 1350000,
    3: 1900000,
    6: 3300000,
    12: 5700000,
  },
  'MT-B': {
    2: 875000,
    3: 1150000,
    6: 2100000,
    12: 3600000,
  },
  'MT-C': {
    2: 600000,
    3: 800000,
    6: 1500000,
    12: 2400000,
  },
  'MT-D': {
    2: 360000,
    3: 510000,
    6: 900000,
    12: 1500000,
  },
};

// 基本企画の定義
const PLANS = {
  'MT-S': {
    id: 'MT-S',
    name: 'MT-S企画',
    price: 1200000,
    period: '4週間',
    features: [
      '最優先表示',
      '情報量最大',
      '社員インタビュー掲載可',
      '職種コード追加可',
      'マイナビ編集部コメント掲載可',
    ],
    searchRank: '最上位',
  },
  'MT-A': {
    id: 'MT-A',
    name: 'MT-A企画',
    price: 750000,
    period: '4週間',
    features: [
      '上位表示',
      '母集団形成に強力',
      '社員インタビュー掲載可',
      '職種コード追加可',
      'マイナビ編集部コメント掲載可',
    ],
    searchRank: '上位',
  },
  'MT-B': {
    id: 'MT-B',
    name: 'MT-B企画',
    price: 500000,
    period: '4週間',
    features: [
      'バランス重視',
      '標準的な露出',
      '社員インタビュー掲載可',
      '職種コード追加可',
      'マイナビ編集部コメント掲載可',
    ],
    searchRank: '中位',
  },
  'MT-C': {
    id: 'MT-C',
    name: 'MT-C企画',
    price: 350000,
    period: '4週間',
    features: [
      'コスト重視',
      '基本情報掲載',
      '社員インタビュー掲載可',
      'マイナビ編集部コメント掲載可',
    ],
    searchRank: '下位',
  },
  'MT-D': {
    id: 'MT-D',
    name: 'MT-D企画',
    price: 200000,
    period: '4週間',
    features: [
      '最小限の掲載',
      '基本募集情報のみ',
      '急ぎの採用向け',
    ],
    searchRank: '最下位',
  },
};

// オプションの定義
const OPTIONS = {
  premiumScout: {
    id: 'premiumScout',
    name: 'プレミアムスカウト',
    price: 200000,
    description: '求職者の受信BOX最上位に表示。開封率70-80%と高い。',
    features: ['開封率70-80%', '最上位表示', '毎週2回配信可能'],
  },
  scoutProxy: {
    id: 'scoutProxy',
    name: 'スカウト代行',
    price: 150000,
    description: 'マイナビ担当者が採用条件にマッチした人材へ一括送信。',
    features: ['専任担当者対応', '週2回配信', '大量採用向け'],
  },
  scout: {
    id: 'scout',
    name: 'スカウト',
    price: 100000,
    description: '企業が自ら候補者を選んで送信。コスト効率的。',
    features: ['企業自身で配信', '候補者絞り込み可', 'コスト効率的'],
  },
  dailyApproach: {
    id: 'dailyApproach',
    name: 'デイリーアプローチ',
    price: 200000,
    description: '新規会員に毎日自動アプローチ。',
    features: ['自動配信', '優先順位設定可', '継続的アプローチ'],
  },
  platinumPlus: {
    id: 'platinumPlus',
    name: 'プラチナプラス',
    price: 300000,
    description: '検索結果でさらに上位表示。露出を大幅強化。',
    features: ['さらに上位表示', '露出強化', '大量採用向け'],
  },
  topReserve: {
    id: 'topReserve',
    name: '検索トップリザーブシート',
    price: 250000,
    description: '特定キーワードの検索結果トップを確保。',
    features: ['トップ表示確保', 'キーワード指定可', '露出最大化'],
  },
};

/**
 * 採用難易度スコアの詳細な内訳を計算
 */
function calculateDifficultyBreakdown(input: ProposalInput): {
  target: number;
  count: number;
  jobType: number;
  period: number;
} {
  // ターゲット別難易度
  const targetDifficulty: Record<string, number> = {
    '新卒': 1,
    '第二新卒': 2,
    '経験者': 3,
    '管理職': 4,
    'スペシャリスト': 5,
  };

  // 採用人数別難易度
  const countDifficulty =
    input.hiringCount === 1 ? 1 :
    input.hiringCount <= 3 ? 1.5 :
    input.hiringCount <= 5 ? 2 :
    input.hiringCount <= 10 ? 2.5 : 3;

  // 職種別難易度
  const jobDifficulty: Record<string, number> = {
    '営業': 1,
    '事務': 1.2,
    '企画': 1.5,
    '技術職': 2,
    'エンジニア': 2,
    'IT': 2,
    '管理職': 2.5,
  };

  // 採用時期別難易度
  const periodDifficulty: Record<string, number> = {
    '1ヶ月以内': 1.5,
    '1-3ヶ月': 1.3,
    '3-6ヶ月': 1,
    '6ヶ月以上': 0.8,
  };

  const target = targetDifficulty[input.targetAudience] || 2;
  const job = jobDifficulty[input.jobType] || 1.5;
  const period = periodDifficulty[input.desiredHiringPeriod] || 1;

  return {
    target,
    count: countDifficulty,
    jobType: job,
    period,
  };
}

/**
 * 採用難易度スコアを計算
 */
function calculateDifficultyScore(input: ProposalInput): number {
  const breakdown = calculateDifficultyBreakdown(input);
  return (breakdown.target + breakdown.count + breakdown.jobType + breakdown.period) / 4;
}

/**
 * 最適な基本企画を選定
 */
function selectPlan(difficultyScore: number, budget: number): string {
  // 予算から選定可能なプランを絞り込む
  const budgetInYen = budget * 10000;

  if (budgetInYen >= 1200000 && difficultyScore > 2.5) {
    return 'MT-S';
  }
  if (budgetInYen >= 750000 && difficultyScore > 2.0) {
    return 'MT-A';
  }
  if (budgetInYen >= 500000 && difficultyScore > 1.5) {
    return 'MT-B';
  }
  if (budgetInYen >= 350000 && difficultyScore > 1.0) {
    return 'MT-C';
  }
  return 'MT-D';
}

/**
 * 推奨オプションを選定
 */
function selectOptions(input: ProposalInput, selectedPlan: string): PlanOption[] {
  const options: PlanOption[] = [];

  // スカウト機能の提案
  if (input.hiringCount >= 5) {
    options.push(OPTIONS.scoutProxy as PlanOption);
  } else if (input.hiringCount >= 3) {
    options.push(OPTIONS.scout as PlanOption);
  }

  // 採用時期が急な場合
  if (input.desiredHiringPeriod === '1ヶ月以内' && input.hiringCount >= 3) {
    options.push(OPTIONS.premiumScout as PlanOption);
  }

  // 露出強化オプション
  const difficultyScore = calculateDifficultyScore(input);
  if (difficultyScore > 2.0 && input.hiringCount >= 5) {
    options.push(OPTIONS.topReserve as PlanOption);
  }

  if (input.hiringCount >= 10) {
    options.push(OPTIONS.platinumPlus as PlanOption);
  }

  return options;
}

/**
 * チケットプランを提案
 */
function selectTicketPlans(selectedPlanId: string, hiringCount: number, desiredPeriod: string): TicketPlan[] {
  const plans: TicketPlan[] = [];
  const ticketPrices = TICKET_PLANS[selectedPlanId];
  const basePricePerCruel = PLANS[selectedPlanId as keyof typeof PLANS].price;

  // 各チケットプランを作成
  for (const [cruel, price] of Object.entries(ticketPrices)) {
    const cruelNum = parseInt(cruel);
    const savingsPercentage = Math.round(
      ((basePricePerCruel * cruelNum - price) / (basePricePerCruel * cruelNum)) * 100
    );
    plans.push({
      id: `ticket-${cruel}`,
      name: `${cruel}クール（${cruelNum * 4}週間）`,
      period: `${cruelNum * 4}週間`,
      price,
      savingsPercentage,
    });
  }

  return plans;
}

/**
 * 提案を生成
 */
export function generateProposal(input: ProposalInput): ProposalOutput {
  const difficultyBreakdown = calculateDifficultyBreakdown(input);
  const difficultyScore = (difficultyBreakdown.target + difficultyBreakdown.count + difficultyBreakdown.jobType + difficultyBreakdown.period) / 4;
  const selectedPlanId = selectPlan(difficultyScore, input.budget);
  const selectedPlan = PLANS[selectedPlanId as keyof typeof PLANS];
  const selectedOptions = selectOptions(input, selectedPlanId);
  const ticketPlans = selectTicketPlans(selectedPlanId, input.hiringCount, input.desiredHiringPeriod);

  // 金額計算
  const basePlanPrice = selectedPlan.price;
  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const subtotal = basePlanPrice + optionsTotal;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  // 選定理由
  let selectedReason = '';
  if (selectedPlanId === 'MT-S') {
    selectedReason = '採用難易度が高く、最大限の露出と情報量が必要と判断しました。';
  } else if (selectedPlanId === 'MT-A') {
    selectedReason = '採用難易度が中程度以上で、母集団形成に強いプランが最適と判断しました。';
  } else if (selectedPlanId === 'MT-B') {
    selectedReason = 'コストと露出のバランスが取れたプランが最適と判断しました。';
  } else if (selectedPlanId === 'MT-C') {
    selectedReason = 'コストを抑えながら基本的な採用活動が可能なプランを選定しました。';
  } else {
    selectedReason = '予算に合わせて最小限のプランを選定しました。オプション追加で効果を高めることをお勧めします。';
  }

  // チケット推奨理由
  let ticketRecommendation = '';
  if (input.desiredHiringPeriod === '6ヶ月以上' || input.hiringCount >= 10) {
    ticketRecommendation = '複数クールの掲載を検討することで、1クール当たりの料金を削減できます。';
  } else if (input.desiredHiringPeriod === '3-6ヶ月') {
    ticketRecommendation = '3クール以上の掲載で、継続的な採用活動が可能になります。';
  } else {
    ticketRecommendation = '長期的な採用計画がある場合は、チケットプランで割引を活用できます。';
  }

  return {
    plan: {
      ...selectedPlan,
      price: basePlanPrice,
    },
    ticketPlans,
    options: selectedOptions,
    pricing: {
      basePlan: basePlanPrice,
      optionsTotal,
      subtotal,
      tax,
      total,
    },
    reasoning: {
      difficultyScore,
      difficultyBreakdown,
      selectedReason,
      optionReasons: selectedOptions.map((_, i) => {
        const reasons: string[] = [];
        if (input.hiringCount >= 5) {
          reasons.push('採用人数が5人以上のため、スカウト代行で効率的な採用活動が可能');
        }
        if (input.desiredHiringPeriod === '1ヶ月以内' && input.hiringCount >= 3) {
          reasons.push('採用時期が1ヶ月以内のため、プレミアムスカウトで開封率を最大化');
        }
        if (difficultyScore > 2.0 && input.hiringCount >= 5) {
          reasons.push('採用難易度が高く採用人数が多いため、検索トップリザーブシートで露出を確保');
        }
        if (input.hiringCount >= 10) {
          reasons.push('大量採用のため、プラチナプラスで検索結果での上位表示を強化');
        }
        return reasons[i] || '';
      }),
      ticketRecommendation,
    },
  };
}
