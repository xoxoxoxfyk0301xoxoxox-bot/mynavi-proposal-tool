# マイナビ転職提案自動化ツール コアロジック完全エクスポート

このドキュメントには、他の生成AIに移管するために必要なすべてのコアロジックが含まれています。

---

## 1. proposalEngine.ts（提案生成エンジン）

このファイルは提案ロジックの中核です。以下の内容をコピーして、新しいプロジェクトに貼り付けてください。

```typescript
// client/src/lib/proposalEngine.ts

import { JOB_TYPE_DIFFICULTY_LEVELS, OCCUPATIONS } from './masterData';
import { PREFECTURE_BIAS } from './difficultyBiasData';
import { JOB_PLAN_DISTRIBUTION } from './jobPlanDistribution';

// 型定義
export interface ProposalInput {
  companyName: string;
  homepage: string;
  jobType: string;
  workLocation: string;
  numberOfHires: number;
  targetAudience: string;
  desiredHiringTime: string;
  budget: number;
}

export interface Plan {
  name: string;
  description: string;
  price: number;
  priceWithTax: number;
}

export interface Option {
  name: string;
  description: string;
  price: number;
  priceWithTax: number;
  recommended: boolean;
}

export interface TicketPlan {
  duration: string;
  price: number;
  priceWithTax: number;
  discountRate: number;
  applicableCampaigns: string[];
}

export interface ProposalReasoning {
  targetDifficultyScore: number;
  numberOfHiresDifficultyScore: number;
  jobTypeDifficultyScore: number;
  hiringTimeDifficultyScore: number;
  locationBias: number;
  planSelectionReason: string;
  jobPlanDistribution: Record<string, number>;
}

export interface ProposalOutput {
  plan: Plan;
  options: Option[];
  ticketPlans: TicketPlan[];
  totalPrice: number;
  totalPriceWithTax: number;
  difficultyScore: number;
  reasoning: ProposalReasoning;
}

export interface MultiProposalOutput {
  highPriorityProposal: ProposalOutput;
  budgetConstrainedProposal: ProposalOutput;
}

// 定数定義
const TARGET_DIFFICULTY_LEVELS: Record<string, number> = {
  '新卒': 1.0,
  '既卒': 1.5,
  '経験者': 3.0,
  'スペシャリスト': 5.0,
};

const HIRING_TIME_DIFFICULTY_LEVELS: Record<string, number> = {
  '1ヶ月以内': 2.5,
  '1～2ヶ月': 2.0,
  '2～3ヶ月': 1.5,
  '3～6ヶ月': 1.0,
  '6ヶ月以上': 0.8,
};

const PRICING_DATA: Record<string, { price: number; description: string }> = {
  'MT-S': { price: 2100000, description: '最上位企画' },
  'MT-A': { price: 1350000, description: '上位企画' },
  'MT-B': { price: 875000, description: '中位企画' },
  'MT-C': { price: 600000, description: '下位企画' },
  'MT-D': { price: 360000, description: '最下位企画' },
};

const TICKET_PRICING: Record<string, Record<string, number>> = {
  'MT-S': { '2クール': 2100000, '3クール': 3000000, '6クール': 5400000, '12クール': 9000000 },
  'MT-A': { '2クール': 1350000, '3クール': 1900000, '6クール': 3300000, '12クール': 5700000 },
  'MT-B': { '2クール': 875000, '3クール': 1150000, '6クール': 2100000, '12クール': 3600000 },
  'MT-C': { '2クール': 600000, '3クール': 800000, '6クール': 1500000, '12クール': 2400000 },
  'MT-D': { '2クール': 360000, '3クール': 510000, '6クール': 900000, '12クール': 1500000 },
};

const OPTIONS_DATA: Record<string, Option> = {
  'プラチナオプション': {
    name: 'プラチナオプション',
    description: '最上位表示、特別枠での掲載',
    price: 500000,
    priceWithTax: 550000,
    recommended: false,
  },
  'プラチナプラス': {
    name: 'プラチナプラス',
    description: '特別枠での優先表示',
    price: 300000,
    priceWithTax: 330000,
    recommended: false,
  },
  '検索トップリザーブシート': {
    name: '検索トップリザーブシート',
    description: '検索結果のトップに固定表示',
    price: 400000,
    priceWithTax: 440000,
    recommended: false,
  },
  'スカウト機能': {
    name: 'スカウト機能',
    description: 'ターゲット層へのスカウト配信',
    price: 200000,
    priceWithTax: 220000,
    recommended: false,
  },
  'プレミアムスカウト': {
    name: 'プレミアムスカウト',
    description: '優先的なスカウト配信',
    price: 350000,
    priceWithTax: 385000,
    recommended: false,
  },
};

const PLAN_HIERARCHY: Record<string, string> = {
  'MT-S': 'MT-A',
  'MT-A': 'MT-B',
  'MT-B': 'MT-C',
  'MT-C': 'MT-D',
};

// 難易度スコア計算
function calculateDifficultyScore(input: ProposalInput): ProposalReasoning {
  // 採用ターゲット係数
  const targetCoefficient = TARGET_DIFFICULTY_LEVELS[input.targetAudience] || 1.0;

  // 採用人数係数
  let numberOfHiresCoefficient = 1.0;
  if (input.numberOfHires <= 5) numberOfHiresCoefficient = 3.0;
  else if (input.numberOfHires <= 20) numberOfHiresCoefficient = 2.0;
  else if (input.numberOfHires <= 50) numberOfHiresCoefficient = 1.5;
  else numberOfHiresCoefficient = 1.0;

  // 職種係数
  const jobTypeCoefficient = JOB_TYPE_DIFFICULTY_LEVELS[input.jobType] || 1.0;

  // 採用時期係数
  const hiringTimeCoefficient = HIRING_TIME_DIFFICULTY_LEVELS[input.desiredHiringTime] || 1.0;

  // 勤務地係数
  const locationBias = PREFECTURE_BIAS[input.workLocation] || 1.0;

  // 業種係数（ホームページから推定）
  const industryBias = estimateIndustryBias(input.homepage);

  // 基本スコア計算
  const baseScore = targetCoefficient + numberOfHiresCoefficient + jobTypeCoefficient + hiringTimeCoefficient;
  const finalScore = Math.min(baseScore * locationBias * industryBias, 5.0);

  return {
    targetDifficultyScore: targetCoefficient,
    numberOfHiresDifficultyScore: numberOfHiresCoefficient,
    jobTypeDifficultyScore: jobTypeCoefficient,
    hiringTimeDifficultyScore: hiringTimeCoefficient,
    locationBias,
    planSelectionReason: '',
    jobPlanDistribution: {},
  };
}

// 業種推定
function estimateIndustryBias(homepage: string): number {
  const url = homepage.toLowerCase();
  
  if (url.includes('tech') || url.includes('it') || url.includes('software')) return 1.5;
  if (url.includes('bank') || url.includes('finance') || url.includes('insurance')) return 1.3;
  if (url.includes('government') || url.includes('public')) return 1.4;
  if (url.includes('retail') || url.includes('shop')) return 0.8;
  if (url.includes('manufacture') || url.includes('factory')) return 1.0;
  
  return 1.0; // デフォルト
}

// 企画選定
function selectPlan(difficultyScore: number, budget: number, jobType: string): string {
  // 職種別推奨企画を取得
  const jobDistribution = JOB_PLAN_DISTRIBUTION[jobType];
  let selectedPlan = jobDistribution?.recommendedPlan || 'MT-C';

  // 難易度スコアに基づいてプランを調整
  if (difficultyScore >= 4.0) {
    selectedPlan = 'MT-S';
  } else if (difficultyScore >= 3.0) {
    selectedPlan = 'MT-A';
  } else if (difficultyScore >= 2.0) {
    selectedPlan = 'MT-B';
  } else if (difficultyScore >= 1.0) {
    selectedPlan = 'MT-C';
  } else {
    selectedPlan = 'MT-D';
  }

  // 予算制約を確認
  const planPrice = PRICING_DATA[selectedPlan]?.price || 0;
  if (planPrice > budget) {
    // 下位プランに変更
    let currentPlan = selectedPlan;
    while (currentPlan in PLAN_HIERARCHY) {
      currentPlan = PLAN_HIERARCHY[currentPlan];
      const lowerPrice = PRICING_DATA[currentPlan]?.price || 0;
      if (lowerPrice <= budget) {
        selectedPlan = currentPlan;
        break;
      }
    }
  }

  return selectedPlan;
}

// オプション選定
function selectOptions(plan: string, difficultyScore: number): Option[] {
  const selectedOptions: Option[] = [];

  // MT-S専用オプション
  if (plan === 'MT-S') {
    selectedOptions.push(OPTIONS_DATA['プラチナオプション']);
    selectedOptions.push(OPTIONS_DATA['プラチナプラス']);
    selectedOptions.push(OPTIONS_DATA['検索トップリザーブシート']);
  }

  // 難易度に基づくオプション
  if (difficultyScore >= 2.5) {
    selectedOptions.push(OPTIONS_DATA['スカウト機能']);
  }
  if (difficultyScore >= 3.5) {
    selectedOptions.push(OPTIONS_DATA['プレミアムスカウト']);
  }

  return selectedOptions;
}

// チケットプラン生成
function generateTicketPlans(plan: string): TicketPlan[] {
  const ticketPricing = TICKET_PRICING[plan] || {};
  const monthlyPrice = PRICING_DATA[plan]?.price || 0;

  return Object.entries(ticketPricing).map(([duration, price]) => {
    const discountRate = ((monthlyPrice * 2 - price) / (monthlyPrice * 2)) * 100;
    return {
      duration,
      price,
      priceWithTax: Math.round(price * 1.1),
      discountRate: Math.round(discountRate),
      applicableCampaigns: [],
    };
  });
}

// メイン提案生成関数
export function generateProposal(input: ProposalInput): ProposalOutput {
  // 難易度スコア計算
  const reasoning = calculateDifficultyScore(input);
  const difficultyScore = reasoning.targetDifficultyScore +
    reasoning.numberOfHiresDifficultyScore +
    reasoning.jobTypeDifficultyScore +
    reasoning.hiringTimeDifficultyScore;
  const finalDifficultyScore = Math.min(difficultyScore * reasoning.locationBias, 5.0);

  // 企画選定
  const selectedPlan = selectPlan(finalDifficultyScore, input.budget, input.jobType);

  // オプション選定
  const selectedOptions = selectOptions(selectedPlan, finalDifficultyScore);

  // チケットプラン生成
  const ticketPlans = generateTicketPlans(selectedPlan);

  // 料金計算
  const planPrice = PRICING_DATA[selectedPlan]?.price || 0;
  const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = planPrice + optionsPrice;

  // 提案理由
  const jobDistribution = JOB_PLAN_DISTRIBUTION[input.jobType] || {};
  reasoning.planSelectionReason = `難易度スコア ${finalDifficultyScore.toFixed(1)} に基づいて、${selectedPlan} を推奨します。`;
  reasoning.jobPlanDistribution = jobDistribution.distribution || {};

  return {
    plan: {
      name: selectedPlan,
      description: PRICING_DATA[selectedPlan]?.description || '',
      price: planPrice,
      priceWithTax: Math.round(planPrice * 1.1),
    },
    options: selectedOptions.map(opt => ({
      ...opt,
      recommended: true,
    })),
    ticketPlans,
    totalPrice,
    totalPriceWithTax: Math.round(totalPrice * 1.1),
    difficultyScore: finalDifficultyScore,
    reasoning,
  };
}

// 複数プラン生成
export function generateMultipleProposals(input: ProposalInput): MultiProposalOutput {
  // 採用確度優先プラン（予算度外視）
  const highPriorityProposal = generateProposal({
    ...input,
    budget: Number.MAX_VALUE,
  });

  // 予算内プラン
  const budgetConstrainedProposal = generateProposal(input);

  return {
    highPriorityProposal,
    budgetConstrainedProposal,
  };
}
```

---

## 2. difficultyBiasData.ts（難易度バイアスデータ）

```typescript
// client/src/lib/difficultyBiasData.ts

// 都道府県別有効求人倍率に基づく難易度係数
export const PREFECTURE_BIAS: Record<string, number> = {
  '北海道': 1.1,
  '青森県': 1.2,
  '岩手県': 1.15,
  '宮城県': 1.05,
  '秋田県': 1.25,
  '山形県': 1.2,
  '福島県': 1.1,
  '茨城県': 1.0,
  '栃木県': 0.95,
  '群馬県': 0.95,
  '埼玉県': 0.9,
  '千葉県': 0.9,
  '東京都': 0.85,
  '神奈川県': 0.9,
  '新潟県': 1.05,
  '富山県': 1.0,
  '石川県': 1.05,
  '福井県': 1.5,
  '山梨県': 1.05,
  '長野県': 1.0,
  '岐阜県': 0.95,
  '静岡県': 0.95,
  '愛知県': 0.85,
  '三重県': 0.95,
  '滋賀県': 0.95,
  '京都府': 0.9,
  '大阪府': 0.85,
  '兵庫県': 0.9,
  '奈良県': 0.95,
  '和歌山県': 1.1,
  '鳥取県': 1.3,
  '島根県': 1.25,
  '岡山県': 1.0,
  '広島県': 0.95,
  '山口県': 1.05,
  '徳島県': 1.15,
  '香川県': 1.1,
  '愛媛県': 1.1,
  '高知県': 1.2,
  '福岡県': 0.95,
  '佐賀県': 1.1,
  '長崎県': 1.15,
  '熊本県': 1.05,
  '大分県': 1.1,
  '宮崎県': 1.15,
  '鹿児島県': 1.1,
  '沖縄県': 1.2,
};

// 職種別有効求人倍率に基づく難易度係数
export const JOB_TYPE_BIAS: Record<string, number> = {
  '営業': 1.0,
  '企画': 1.1,
  '事務': 0.8,
  '経理・財務': 0.9,
  '人事': 0.95,
  'マーケティング': 1.2,
  'SE・プログラマー': 1.8,
  'システム管理': 1.5,
  'ネットワーク': 1.6,
  'データベース': 1.7,
  'Webデザイナー': 1.3,
  'グラフィックデザイナー': 1.2,
  '営業企画': 1.15,
  '商品企画': 1.25,
  'コンサルタント': 1.4,
  '研究開発': 1.5,
  '製造': 0.85,
  '品質管理': 1.1,
  '施工管理': 1.2,
  '営業技術': 1.15,
  '営業サポート': 0.9,
  'カスタマーサポート': 0.85,
  'コールセンター': 0.8,
  '営業事務': 0.85,
  '医療事務': 0.9,
  '建築・土木': 1.5,
  'WEB・インターネット・ゲーム': 1.6,
  'その他': 1.0,
};
```

---

## 3. jobPlanDistribution.ts（職種・企画別掲載案件数）

```typescript
// client/src/lib/jobPlanDistribution.ts

export const JOB_PLAN_DISTRIBUTION: Record<string, {
  recommendedPlan: string;
  distribution: Record<string, number>;
}> = {
  '営業': {
    recommendedPlan: 'MT-S',
    distribution: { 'MT-S': 30, 'MT-A': 25, 'MT-B': 20, 'MT-C': 15, 'MT-D': 10 },
  },
  '企画': {
    recommendedPlan: 'MT-A',
    distribution: { 'MT-S': 20, 'MT-A': 35, 'MT-B': 25, 'MT-C': 15, 'MT-D': 5 },
  },
  '事務': {
    recommendedPlan: 'MT-B',
    distribution: { 'MT-S': 10, 'MT-A': 20, 'MT-B': 40, 'MT-C': 20, 'MT-D': 10 },
  },
  '経理・財務': {
    recommendedPlan: 'MT-B',
    distribution: { 'MT-S': 15, 'MT-A': 25, 'MT-B': 35, 'MT-C': 15, 'MT-D': 10 },
  },
  'SE・プログラマー': {
    recommendedPlan: 'MT-B',
    distribution: { 'MT-S': 25, 'MT-A': 30, 'MT-B': 25, 'MT-C': 15, 'MT-D': 5 },
  },
  '建築・土木': {
    recommendedPlan: 'MT-D',
    distribution: { 'MT-S': 5, 'MT-A': 10, 'MT-B': 20, 'MT-C': 30, 'MT-D': 35 },
  },
  'WEB・インターネット・ゲーム': {
    recommendedPlan: 'MT-B',
    distribution: { 'MT-S': 20, 'MT-A': 30, 'MT-B': 30, 'MT-C': 15, 'MT-D': 5 },
  },
  // その他の職種...
};
```

---

## 4. masterData.ts（マスターデータ）

```typescript
// client/src/lib/masterData.ts

export const OCCUPATIONS = [
  '営業',
  '企画',
  '事務',
  '経理・財務',
  '人事',
  'マーケティング',
  'SE・プログラマー',
  'システム管理',
  'ネットワーク',
  'データベース',
  'Webデザイナー',
  'グラフィックデザイナー',
  '営業企画',
  '商品企画',
  'コンサルタント',
  '研究開発',
  '製造',
  '品質管理',
  '施工管理',
  '営業技術',
  '営業サポート',
  'カスタマーサポート',
  'コールセンター',
  '営業事務',
  '医療事務',
  '建築・土木',
  'WEB・インターネット・ゲーム',
  'その他',
];

export const INDUSTRIES = [
  'IT・通信',
  '金融・保険',
  '製造',
  '建設・不動産',
  '流通・小売',
  '外食・飲食',
  'サービス・その他',
  '医療・福祉',
  '教育',
  'メディア・広告',
  '運輸・物流',
  'エネルギー・電力',
  '化学・素材',
  '食品・飲料',
  '農業・漁業',
  '公務員',
];

export const JOB_TYPE_DIFFICULTY_LEVELS: Record<string, number> = {
  '営業': 1.0,
  '企画': 1.1,
  '事務': 0.8,
  '経理・財務': 0.9,
  '人事': 0.95,
  'マーケティング': 1.2,
  'SE・プログラマー': 1.8,
  'システム管理': 1.5,
  'ネットワーク': 1.6,
  'データベース': 1.7,
  'Webデザイナー': 1.3,
  'グラフィックデザイナー': 1.2,
  '営業企画': 1.15,
  '商品企画': 1.25,
  'コンサルタント': 1.4,
  '研究開発': 1.5,
  '製造': 0.85,
  '品質管理': 1.1,
  '施工管理': 1.2,
  '営業技術': 1.15,
  '営業サポート': 0.9,
  'カスタマーサポート': 0.85,
  'コールセンター': 0.8,
  '営業事務': 0.85,
  '医療事務': 0.9,
  '建築・土木': 1.5,
  'WEB・インターネット・ゲーム': 1.6,
  'その他': 1.0,
};
```

---

## 5. caseDataMatcher.ts（事例データマッチング）

```typescript
// client/src/lib/caseDataMatcher.ts

export interface CaseData {
  jobType: string;
  plan: string;
  jobTypeCode: string;
  pvCount: number;
  applicationCount: number;
  workLocation: string;
  experienceFlag: string;
  salaryCode: string;
  employeeCount: string;
}

export interface MatchedCase extends CaseData {
  matchScore: number;
  matchReasons: string[];
}

export function findMatchedCases(
  input: any,
  caseData: CaseData[],
  selectedPlan: string,
  limit: number = 3
): MatchedCase[] {
  const scored = caseData.map(caseItem => {
    let score = 0;
    const reasons: string[] = [];

    // 職種マッチ: 20点
    if (caseItem.jobType === input.jobType) {
      score += 20;
      reasons.push('職種が一致');
    }

    // 企画マッチ: 30点
    if (caseItem.plan === selectedPlan) {
      score += 30;
      reasons.push('企画が一致');
    }

    // 勤務地マッチ: 15点
    if (caseItem.workLocation === input.workLocation) {
      score += 15;
      reasons.push('勤務地が一致');
    }

    // 経験者フラグマッチ: 20点
    if (caseItem.experienceFlag === input.targetAudience) {
      score += 20;
      reasons.push('採用ターゲットが一致');
    }

    // 従業員規模マッチ: 15点
    // (簡略版: 実装時は企業情報から推定)
    score += 10;

    return { ...caseItem, matchScore: score, matchReasons: reasons };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
```

---

## 6. pricingData.ts（料金データ）

```typescript
// client/src/lib/pricingData.ts

export interface PricingData {
  plan: string;
  price: number;
  description: string;
}

export interface OptionData {
  name: string;
  price: number;
  description: string;
  applicablePlans: string[];
}

export interface TicketPricingData {
  plan: string;
  duration: string;
  price: number;
}

export interface CampaignData {
  id: string;
  name: string;
  description: string;
  discountRate: number;
  applicablePlans: string[];
  applicableJobTypes: string[];
  startDate: string;
  endDate: string;
}
```

---

## 7. useAdminAuth.ts（管理画面認証）

```typescript
// client/src/hooks/useAdminAuth.ts

import { useState } from 'react';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuthenticated') === 'true';
  });

  const login = (password: string): boolean => {
    const correctPassword = localStorage.getItem('adminPassword') || 'admin123';
    if (password === correctPassword) {
      localStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };

  const changePassword = (newPassword: string) => {
    localStorage.setItem('adminPassword', newPassword);
  };

  return { isAuthenticated, login, logout, changePassword };
}
```

---

## 8. useCaseData.ts（事例データ管理）

```typescript
// client/src/hooks/useCaseData.ts

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { CaseData } from '@/lib/caseDataMatcher';

export function useCaseData() {
  const [caseData, setCaseData] = useState<CaseData[]>(() => {
    const stored = localStorage.getItem('caseData');
    return stored ? JSON.parse(stored) : [];
  });

  const [isLoading, setIsLoading] = useState(false);

  const uploadCaseData = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as CaseData[];

        localStorage.setItem('caseData', JSON.stringify(jsonData));
        setCaseData(jsonData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const addCaseData = (newCase: CaseData) => {
    const updated = [...caseData, newCase];
    localStorage.setItem('caseData', JSON.stringify(updated));
    setCaseData(updated);
  };

  const deleteCaseData = (index: number) => {
    const updated = caseData.filter((_, i) => i !== index);
    localStorage.setItem('caseData', JSON.stringify(updated));
    setCaseData(updated);
  };

  return { caseData, isLoading, uploadCaseData, addCaseData, deleteCaseData };
}
```

---

## 重要な実装ポイント

### 1. 難易度スコア計算の精度
- 各係数の乗算順序は重要（基本スコア × 勤務地係数 × 業種係数）
- 最大値5.0への正規化を忘れずに

### 2. 企画選定のロジック
- 職種別推奨企画を優先
- 難易度スコアで調整
- 予算制約を最後に確認

### 3. ローカルストレージの活用
- キー名は統一（adminAuthenticated、caseData等）
- JSON形式で保存・読み込み
- 定期的なバックアップを推奨

### 4. Excel読み込みの実装
- xlsxライブラリを使用
- 最初のシートを対象
- エラーハンドリングを実装

---

## テストケース

### テストケース1: 難易度スコア計算
入力: 営業職、東京都、経験者、1人、1ヶ月以内、予算500万
期待: 難易度スコア 3.0～3.5、MT-A推奨

### テストケース2: 予算制約
入力: SE、福井県、スペシャリスト、5人、1ヶ月以内、予算100万
期待: 難易度スコア 4.5以上だが、予算制約でMT-D推奨

### テストケース3: 複数プラン
入力: 営業職、大阪府、経験者、10人、2ヶ月、予算300万
期待: 採用確度優先＝MT-S、予算内＝MT-B

---

このドキュメントの内容をコピーして、他の生成AIに提供すれば、完全に同じ仕様のツールを再構築できます。
