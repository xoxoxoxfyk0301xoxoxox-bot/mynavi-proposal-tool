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

export interface ProposalOutput {
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    searchRank: string;
  };
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
    selectedReason: string;
    optionReasons: string[];
  };
}

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
 * 採用難易度スコアを計算
 */
function calculateDifficultyScore(input: ProposalInput): number {
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

  return (target + countDifficulty + job + period) / 4;
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
  const reasons: string[] = [];

  // スカウト機能の提案
  if (input.hiringCount >= 5) {
    options.push(OPTIONS.scoutProxy as PlanOption);
    reasons.push('採用人数が5人以上のため、スカウト代行で効率的な採用活動が可能');
  } else if (input.hiringCount >= 3) {
    options.push(OPTIONS.scout as PlanOption);
    reasons.push('採用人数が3人以上のため、スカウト機能で候補者に直接アプローチ');
  }

  // 採用時期が急な場合
  if (input.desiredHiringPeriod === '1ヶ月以内' && input.hiringCount >= 3) {
    options.push(OPTIONS.premiumScout as PlanOption);
    reasons.push('採用時期が1ヶ月以内のため、プレミアムスカウトで開封率を最大化');
  }

  // 露出強化オプション
  const difficultyScore = calculateDifficultyScore(input);
  if (difficultyScore > 2.0 && input.hiringCount >= 5) {
    options.push(OPTIONS.topReserve as PlanOption);
    reasons.push('採用難易度が高く採用人数が多いため、検索トップリザーブシートで露出を確保');
  }

  if (input.hiringCount >= 10) {
    options.push(OPTIONS.platinumPlus as PlanOption);
    reasons.push('大量採用のため、プラチナプラスで検索結果での上位表示を強化');
  }

  return options;
}

/**
 * 提案を生成
 */
export function generateProposal(input: ProposalInput): ProposalOutput {
  const difficultyScore = calculateDifficultyScore(input);
  const selectedPlanId = selectPlan(difficultyScore, input.budget);
  const selectedPlan = PLANS[selectedPlanId as keyof typeof PLANS];
  const selectedOptions = selectOptions(input, selectedPlanId);

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

  return {
    plan: {
      ...selectedPlan,
      price: basePlanPrice,
    },
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
      selectedReason,
      optionReasons: selectOptions(input, selectedPlanId).map((_, i) => {
        const reasons: string[] = [];
        if (input.hiringCount >= 5) {
          reasons.push('採用人数が5人以上のため、スカウト代行で効率的な採用活動が可能');
        }
        if (input.desiredHiringPeriod === '1ヶ月以内' && input.hiringCount >= 3) {
          reasons.push('採用時期が1ヶ月以内のため、プレミアムスカウトで開封率を最大化');
        }
        if (calculateDifficultyScore(input) > 2.0 && input.hiringCount >= 5) {
          reasons.push('採用難易度が高く採用人数が多いため、検索トップリザーブシートで露出を確保');
        }
        if (input.hiringCount >= 10) {
          reasons.push('大量採用のため、プラチナプラスで検索結果での上位表示を強化');
        }
        return reasons[i] || '';
      }),
    },
  };
}
