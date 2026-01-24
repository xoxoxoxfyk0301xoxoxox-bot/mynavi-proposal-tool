# マイナビ転職提案自動化ツール 完全仕様書

## 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [機能仕様](#機能仕様)
4. [データ構造](#データ構造)
5. [提案ロジック](#提案ロジック)
6. [ファイル構成](#ファイル構成)
7. [実装詳細](#実装詳細)

---

## プロジェクト概要

**プロジェクト名**: マイナビ転職提案自動化ツール  
**目的**: 企業の採用情報を入力すると、最適なマイナビ転職の企画、オプション、チケットプランを自動提案するツール  
**対象ユーザー**: マイナビ転職の営業担当者、採用支援企業

### 主な機能
- 採用情報の入力フォーム（8項目）
- 採用難易度の自動計算
- 複数プランの自動提案（推奨プラン＋予算内プラン）
- 提案理由の詳細説明
- 他社事例の自動抽出・表示
- PDF提案書の出力
- 管理画面でのマスターデータ管理
- パスワード保護

---

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **UI フレームワーク**: shadcn/ui + Tailwind CSS 4
- **ルーティング**: Wouter
- **チャート**: Recharts
- **PDF生成**: HTML to PDF (ブラウザ印刷機能)
- **Excel読み込み**: xlsx
- **ビルドツール**: Vite
- **パッケージマネージャー**: pnpm

---

## 機能仕様

### 1. ホーム画面（利用者向け）

#### 左側：採用情報入力フォーム
入力項目（8項目）:
1. **企業名** (テキスト): 採用企業の名称
2. **ホームページ** (URL): 企業のホームページURL（業種推定に使用）
3. **採用職種** (ドロップダウン): 30職種から選択
4. **勤務地** (テキスト): 都道府県名（難易度調整に使用）
5. **採用人数** (数値): 採用予定人数
6. **採用ターゲット** (ドロップダウン): 新卒/既卒/経験者など
7. **希望採用時期** (ドロップダウン): 1ヶ月以内～6ヶ月以上
8. **予算** (数値): 採用予算（税抜）

#### 右側：提案結果表示
- **推奨プラン**: 難易度と予算を考慮した最適なプラン
- **複数プラン比較**: 採用確度優先プラン＋予算内プラン
- **他社事例**: マッチスコアが高い3件の事例
- **提案理由**: 詳細な根拠説明

### 2. 管理画面（管理者向け）

#### ログイン
- パスワード保護（デフォルト: admin123）
- ローカルストレージに認証情報を保存

#### データ管理（5つのタブ）
1. **事例データ**: 掲載実績データ（職種、PV数、応募数など）
2. **料金表**: 各企画の基本料金
3. **チケット料金**: 2クール～12クール別の料金
4. **オプション**: 各オプションの料金と説明
5. **キャンペーン**: 期間限定キャンペーン情報

#### 機能
- Excelファイルのアップロード
- テーブル形式での直接入力
- テンプレートのダウンロード
- パスワード変更

---

## データ構造

### ProposalInput（入力データ）
```typescript
interface ProposalInput {
  companyName: string;
  homepage: string;
  jobType: string;
  workLocation: string;
  numberOfHires: number;
  targetAudience: string;
  desiredHiringTime: string;
  budget: number;
}
```

### ProposalOutput（提案結果）
```typescript
interface ProposalOutput {
  plan: {
    name: string;
    description: string;
    price: number;
    priceWithTax: number;
  };
  options: Array<{
    name: string;
    description: string;
    price: number;
    priceWithTax: number;
    recommended: boolean;
  }>;
  ticketPlans: Array<{
    duration: string;
    price: number;
    priceWithTax: number;
    discountRate: number;
    applicableCampaigns: string[];
  }>;
  totalPrice: number;
  totalPriceWithTax: number;
  difficultyScore: number;
  reasoning: {
    targetDifficultyScore: number;
    numberOfHiresDifficultyScore: number;
    jobTypeDifficultyScore: number;
    hiringTimeDifficultyScore: number;
    locationBias: number;
    planSelectionReason: string;
    jobPlanDistribution: Record<string, number>;
  };
}
```

### MultiProposalOutput（複数プラン）
```typescript
interface MultiProposalOutput {
  highPriorityProposal: ProposalOutput;
  budgetConstrainedProposal: ProposalOutput;
}
```

### CaseData（事例データ）
```typescript
interface CaseData {
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
```

---

## 提案ロジック

### 1. 難易度スコア計算

難易度スコア = (採用ターゲット係数 + 採用人数係数 + 職種係数 + 採用時期係数) × 勤務地係数 × 業種係数

#### 各係数の定義

**採用ターゲット係数** (0.5～5.0):
- 新卒: 1.0
- 既卒: 1.5
- 経験者: 3.0
- スペシャリスト: 5.0

**採用人数係数** (1.0～3.0):
- 1～5人: 3.0
- 6～20人: 2.0
- 21～50人: 1.5
- 51人以上: 1.0

**職種係数** (1.0～2.0):
- 営業: 1.0
- 事務: 0.8
- SE・プログラマー: 1.8
- 建築・土木: 1.5
- など（masterData.tsに全30職種定義）

**採用時期係数** (1.0～2.5):
- 1ヶ月以内: 2.5
- 1～2ヶ月: 2.0
- 2～3ヶ月: 1.5
- 3～6ヶ月: 1.0
- 6ヶ月以上: 0.8

**勤務地係数** (0.8～1.5):
- 有効求人倍率に基づいて計算
- JIL統計データから47都道府県別に定義
- 例: 福井県（高倍率）: 1.5、東京都（低倍率）: 0.9

**業種係数** (0.8～1.5):
- ホームページのURLから業種を推定
- IT・通信: 1.5
- 金融・保険: 1.3
- 製造: 1.0
- 流通・小売: 0.8
- など

### 2. 企画選定ロジック

#### ステップ1: 職種別推奨企画の決定
職種・企画別掲載案件数データから、各職種で最も掲載案件数が多い企画を推奨企画とする。

例:
- 営業職: MT-S (445案件)
- 建築・土木: MT-D (120案件)
- WEB・インターネット: MT-B (200案件)

#### ステップ2: 難易度スコアに基づくプラン選定

**採用確度優先プラン** (予算度外視):
- 難易度スコア ≥ 4.0: 推奨企画またはMT-S
- 難易度スコア 3.0～3.9: 推奨企画またはMT-A
- 難易度スコア 2.0～2.9: 推奨企画またはMT-B
- 難易度スコア 1.0～1.9: 推奨企画またはMT-C
- 難易度スコア < 1.0: 推奨企画またはMT-D

**予算内プラン** (予算制約あり):
- 上記と同じロジックだが、提案料金が予算内に収まるプランを選定
- 収まらない場合は、下位プランに変更

### 3. オプション推奨ロジック

**MT-S提案の場合のみ推奨**:
- プラチナオプション
- プラチナプラス
- 検索トップリザーブシート

**全プラン共通で推奨**:
- スカウト機能（難易度スコア ≥ 2.5の場合）
- プレミアムスカウト（難易度スコア ≥ 3.5の場合）

### 4. チケットプラン提案ロジック

難易度スコア ≥ 3.0の場合、チケットプラン（2クール～12クール）を提案。
各クール数の割引率を計算し、長期掲載による効果を提示。

### 5. キャンペーン適用ロジック

管理者が登録したキャンペーンから、以下の条件に合致するものを自動適用:
- 対象企画が一致
- 対象職種が一致（または全職種対象）
- キャンペーン期間内

---

## ファイル構成

### コアロジック
```
client/src/lib/
├── proposalEngine.ts          # 提案生成エンジン（メインロジック）
├── caseDataMatcher.ts         # 事例データマッチング
├── difficultyBiasData.ts      # 難易度バイアスデータ（都道府県・職種）
├── jobPlanDistribution.ts     # 職種・企画別掲載案件数
├── masterData.ts              # 職種・業種マスターデータ
├── pricingData.ts             # 料金データ型定義
└── proposalPdfGenerator.ts    # PDF提案書生成
```

### コンポーネント
```
client/src/components/
├── ProposalForm.tsx           # 入力フォーム
├── ProposalResult.tsx         # 提案結果表示
├── ProposalLogicExplainer.tsx # 提案ロジック説明
├── MultiProposalComparison.tsx# 複数プラン比較
├── CaseExamples.tsx           # 他社事例表示
├── CaseDataUploader.tsx       # データアップロード（管理画面）
└── ui/                        # shadcn/ui コンポーネント
```

### ページ
```
client/src/pages/
├── Home.tsx                   # ホーム画面（利用者向け）
├── AdminLogin.tsx             # 管理画面ログイン
├── AdminCaseData.tsx          # 管理画面（データ管理）
├── AdminSettings.tsx          # 管理画面（設定）
└── NotFound.tsx               # 404ページ
```

### ホック
```
client/src/hooks/
├── useAdminAuth.ts            # 管理画面認証
├── useCaseData.ts             # 事例データ読み込み
└── その他の汎用ホック
```

---

## 実装詳細

### 1. 難易度スコア計算の実装

**ファイル**: `client/src/lib/proposalEngine.ts`

```typescript
function calculateDifficultyScore(input: ProposalInput): number {
  // 採用ターゲット係数
  const targetCoefficient = TARGET_DIFFICULTY_LEVELS[input.targetAudience] || 1.0;
  
  // 採用人数係数
  const numberOfHiresCoefficient = calculateNumberOfHiresCoefficient(input.numberOfHires);
  
  // 職種係数
  const jobTypeCoefficient = JOB_TYPE_DIFFICULTY_LEVELS[input.jobType] || 1.0;
  
  // 採用時期係数
  const hiringTimeCoefficient = HIRING_TIME_DIFFICULTY_LEVELS[input.desiredHiringTime] || 1.0;
  
  // 勤務地係数
  const locationBias = PREFECTURE_BIAS[input.workLocation] || 1.0;
  
  // 業種係数
  const industryBias = estimateIndustryBias(input.homepage);
  
  // 総合スコア計算
  const baseScore = targetCoefficient + numberOfHiresCoefficient + jobTypeCoefficient + hiringTimeCoefficient;
  const finalScore = baseScore * locationBias * industryBias;
  
  return Math.min(finalScore, 5.0); // 最大5.0に正規化
}
```

### 2. 企画選定の実装

**ファイル**: `client/src/lib/proposalEngine.ts`

```typescript
function selectPlan(difficultyScore: number, budget: number, jobType: string): string {
  // 職種別推奨企画を取得
  const recommendedPlan = JOB_PLAN_DISTRIBUTION[jobType]?.recommendedPlan || 'MT-C';
  
  // 難易度スコアに基づいてプランを調整
  let selectedPlan = recommendedPlan;
  
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
    const lowerPlan = PLAN_HIERARCHY[selectedPlan];
    if (lowerPlan && PRICING_DATA[lowerPlan].price <= budget) {
      selectedPlan = lowerPlan;
    }
  }
  
  return selectedPlan;
}
```

### 3. 複数プラン生成の実装

**ファイル**: `client/src/lib/proposalEngine.ts`

```typescript
function generateMultipleProposals(input: ProposalInput): MultiProposalOutput {
  // 採用確度優先プラン（予算度外視）
  const highPriorityProposal = generateProposal({
    ...input,
    budget: Number.MAX_VALUE // 予算制限なし
  });
  
  // 予算内プラン
  const budgetConstrainedProposal = generateProposal(input);
  
  return {
    highPriorityProposal,
    budgetConstrainedProposal
  };
}
```

### 4. 他社事例マッチングの実装

**ファイル**: `client/src/lib/caseDataMatcher.ts`

```typescript
function findMatchedCases(
  input: ProposalInput,
  caseData: CaseData[],
  selectedPlan: string,
  limit: number = 3
): MatchedCase[] {
  // マッチスコア計算
  const scored = caseData.map(caseItem => {
    let score = 0;
    
    // 職種マッチ: 20点
    if (caseItem.jobType === input.jobType) score += 20;
    
    // 企画マッチ: 30点
    if (caseItem.plan === selectedPlan) score += 30;
    
    // 勤務地マッチ: 15点
    if (caseItem.workLocation === input.workLocation) score += 15;
    
    // 経験者フラグマッチ: 20点
    if (caseItem.experienceFlag === input.targetAudience) score += 20;
    
    // 従業員規模マッチ: 15点
    if (isEmployeeSizeMatched(caseItem.employeeCount, input.companyName)) score += 15;
    
    return { ...caseItem, matchScore: score };
  });
  
  // スコアでソートして上位を返す
  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
```

### 5. PDF提案書生成の実装

**ファイル**: `client/src/lib/proposalPdfGenerator.ts`

```typescript
function generateProposalPdf(proposal: ProposalOutput, input: ProposalInput): void {
  // HTML提案書を生成
  const proposalHtml = generateProposalHtml(proposal, input);
  
  // ブラウザの印刷ダイアログを開く
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow?.document.write(proposalHtml);
  printWindow?.document.close();
  printWindow?.print();
}
```

### 6. 管理画面認証の実装

**ファイル**: `client/src/hooks/useAdminAuth.ts`

```typescript
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

### 7. 事例データ管理の実装

**ファイル**: `client/src/hooks/useCaseData.ts`

```typescript
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
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      localStorage.setItem('caseData', JSON.stringify(jsonData));
      setCaseData(jsonData);
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };
  
  return { caseData, isLoading, uploadCaseData };
}
```

---

## マスターデータ定義

### 職種一覧（30職種）
営業、企画、事務、経理・財務、人事、マーケティング、SE・プログラマー、システム管理、ネットワーク、データベース、Webデザイナー、グラフィックデザイナー、営業企画、商品企画、コンサルタント、研究開発、製造、品質管理、施工管理、営業技術、営業サポート、カスタマーサポート、コールセンター、営業事務、医療事務、建築・土木、WEB・インターネット・ゲーム、その他

### 業種一覧（20業種）
IT・通信、金融・保険、製造、建設・不動産、流通・小売、外食・飲食、サービス・その他、医療・福祉、教育、メディア・広告、運輸・物流、エネルギー・電力、化学・素材、食品・飲料、農業・漁業、公務員、など

### 企画（5段階）
- **MT-S**: 最上位企画（月額210万円～）
- **MT-A**: 上位企画（月額135万円～）
- **MT-B**: 中位企画（月額87.5万円～）
- **MT-C**: 下位企画（月額60万円～）
- **MT-D**: 最下位企画（月額36万円～）

### チケット料金（長期掲載プラン）

| 企画 | 2クール | 3クール | 6クール | 12クール |
|------|--------|--------|--------|----------|
| MT-S | 210万 | 300万 | 540万 | 900万 |
| MT-A | 135万 | 190万 | 330万 | 570万 |
| MT-B | 87.5万 | 115万 | 210万 | 360万 |
| MT-C | 60万 | 80万 | 150万 | 240万 |
| MT-D | 36万 | 51万 | 90万 | 150万 |

### オプション

| オプション名 | 対象企画 | 料金 | 説明 |
|-------------|--------|------|------|
| プラチナオプション | MT-S | 50万 | 最上位表示 |
| プラチナプラス | MT-S | 30万 | 特別枠表示 |
| 検索トップリザーブシート | MT-S | 40万 | 検索結果トップ固定 |
| スカウト機能 | 全企画 | 20万 | スカウト配信 |
| プレミアムスカウト | 全企画 | 35万 | 優先スカウト配信 |

---

## 環境変数・設定

### ローカルストレージキー
- `adminAuthenticated`: 管理画面認証状態
- `adminPassword`: 管理画面パスワード
- `caseData`: 事例データ（JSON）
- `pricingData`: 料金表（JSON）
- `ticketPricingData`: チケット料金（JSON）
- `optionsData`: オプション情報（JSON）
- `campaignData`: キャンペーン情報（JSON）

---

## 今後の拡張可能性

1. **バックエンド統合**: ローカルストレージからデータベースへの移行
2. **ユーザー管理**: 複数管理者の管理、権限分離
3. **分析ダッシュボード**: 提案統計、成功率分析
4. **API連携**: CRM、SFA等との連携
5. **メール送信**: 提案書の自動メール配信
6. **バージョン管理**: 提案履歴の保存・比較
7. **多言語対応**: 英語、中国語等への対応

---

## デプロイ・運用

### 本番環境へのデプロイ
1. `pnpm build` でビルド
2. `dist/` ディレクトリをサーバーにアップロード
3. Manus管理画面から「Publish」ボタンでデプロイ

### バックアップ
- ローカルストレージのデータは定期的にブラウザのエクスポート機能でバックアップ
- 管理画面からExcelでダウンロード可能

---

## トラブルシューティング

### 提案が生成されない
- ブラウザのコンソールでエラーを確認
- 入力値の形式を確認（特に数値項目）

### 管理画面にアクセスできない
- パスワードを確認（デフォルト: admin123）
- ローカルストレージをクリア後、再度ログイン

### 事例データが表示されない
- 管理画面でデータが正しくアップロードされているか確認
- Excelファイルの形式を確認（.xlsx推奨）

---

## 連絡先・サポート

このツールに関するご質問やご要望は、プロジェクト管理者までお問い合わせください。
