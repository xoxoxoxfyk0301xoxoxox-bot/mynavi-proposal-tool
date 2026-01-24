import { ProposalInput } from './proposalEngine';

/**
 * 掲載実績データの型定義
 */
export interface CaseData {
  jobType: string;           // 職種名
  plan: string;              // 企画（MT-S, MT-A, MT-B, MT-C, MT-D）
  jobCode: string;           // 職種コード
  pvCount: number;           // PV数
  applicationCount: number;  // 応募数
  location: string;          // 勤務地
  experienceFlag: string;    // 経験者フラグ（経験者/未経験者）
  salaryCode: string;        // 年収コード
  employeeCount: string;     // 従業員数
}

/**
 * マッチング結果の型定義
 */
export interface MatchedCase {
  caseData: CaseData;
  matchScore: number;        // マッチスコア（0-100）
  matchReasons: string[];    // マッチ理由
}

/**
 * Excelファイル（CSV形式）を解析してCaseDataに変換
 */
export function parseCaseDataFromCSV(csvText: string): CaseData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // ヘッダー行を取得
  const headers = lines[0].split(',').map(h => h.trim());
  
  // 列インデックスを取得
  const getColumnIndex = (name: string) => headers.findIndex(h => h.includes(name));
  
  const jobTypeIdx = getColumnIndex('職種名');
  const planIdx = getColumnIndex('企画');
  const jobCodeIdx = getColumnIndex('職種コード');
  const pvIdx = getColumnIndex('pv数');
  const appIdx = getColumnIndex('応募数');
  const locationIdx = getColumnIndex('勤務地');
  const expIdx = getColumnIndex('経験者フラグ');
  const salaryIdx = getColumnIndex('年収コード');
  const empIdx = getColumnIndex('従業員数');

  const cases: CaseData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length < 2) continue;

    cases.push({
      jobType: values[jobTypeIdx] || '',
      plan: values[planIdx] || '',
      jobCode: values[jobCodeIdx] || '',
      pvCount: parseInt(values[pvIdx]) || 0,
      applicationCount: parseInt(values[appIdx]) || 0,
      location: values[locationIdx] || '',
      experienceFlag: values[expIdx] || '',
      salaryCode: values[salaryIdx] || '',
      employeeCount: values[empIdx] || '',
    });
  }

  return cases;
}

/**
 * 入力条件に基づいて類似企業事例を検索
 */
export function findMatchedCases(
  input: ProposalInput,
  allCases: CaseData[],
  selectedPlan: string,
  limit: number = 3
): MatchedCase[] {
  const matched: MatchedCase[] = [];

  for (const caseData of allCases) {
    const score = calculateMatchScore(input, caseData, selectedPlan);
    if (score > 0) {
      matched.push({
        caseData,
        matchScore: score,
        matchReasons: getMatchReasons(input, caseData, selectedPlan),
      });
    }
  }

  // スコアが高い順にソート
  matched.sort((a, b) => b.matchScore - a.matchScore);

  return matched.slice(0, limit);
}

/**
 * マッチスコアを計算（0-100）
 */
function calculateMatchScore(
  input: ProposalInput,
  caseData: CaseData,
  selectedPlan: string
): number {
  let score = 0;

  // 勤務地の一致（30点）
  if (caseData.location.includes(input.location) || input.location.includes(caseData.location)) {
    score += 30;
  } else if (isSameRegion(input.location, caseData.location)) {
    score += 15;
  }

  // 職種の一致（25点）
  if (caseData.jobType.includes(input.jobType) || input.jobType.includes(caseData.jobType)) {
    score += 25;
  }

  // 経験者フラグの一致（20点）
  const isExperienced = input.targetAudience === '経験者' || input.targetAudience === '管理職';
  const caseIsExperienced = caseData.experienceFlag.includes('経験者');
  if (isExperienced === caseIsExperienced) {
    score += 20;
  }

  // 企画の一致（15点）
  if (caseData.plan === selectedPlan) {
    score += 15;
  } else if (isPlanSimilar(caseData.plan, selectedPlan)) {
    score += 8;
  }

  // 従業員数の近さ（10点）
  // 注：inputには従業員数がないため、スキップ

  return score;
}

/**
 * マッチ理由を生成
 */
function getMatchReasons(
  input: ProposalInput,
  caseData: CaseData,
  selectedPlan: string
): string[] {
  const reasons: string[] = [];

  if (caseData.location.includes(input.location) || input.location.includes(caseData.location)) {
    reasons.push(`勤務地が一致（${caseData.location}）`);
  }

  if (caseData.jobType.includes(input.jobType) || input.jobType.includes(caseData.jobType)) {
    reasons.push(`職種が一致（${caseData.jobType}）`);
  }

  const isExperienced = input.targetAudience === '経験者' || input.targetAudience === '管理職';
  const caseIsExperienced = caseData.experienceFlag.includes('経験者');
  if (isExperienced === caseIsExperienced) {
    reasons.push(`採用ターゲットが一致（${caseData.experienceFlag}）`);
  }

  if (caseData.plan === selectedPlan) {
    reasons.push(`同じ企画を使用（${caseData.plan}）`);
  }

  // 注：inputには従業員数がないため、スキップ

  return reasons;
}

/**
 * 同じ地域かどうかを判定
 */
function isSameRegion(location1: string, location2: string): boolean {
  const regions = ['東京', '神奈川', '千葉', '埼玉', '大阪', '京都', '兵庫', '愛知', '福岡'];
  for (const region of regions) {
    if (location1.includes(region) && location2.includes(region)) {
      return true;
    }
  }
  return false;
}

/**
 * 企画が類似しているかどうかを判定
 */
function isPlanSimilar(plan1: string, plan2: string): boolean {
  // 同じレベルの企画を判定
  const planLevels: { [key: string]: number } = {
    'MT-S': 5,
    'MT-A': 4,
    'MT-B': 3,
    'MT-C': 2,
    'MT-D': 1,
  };

  const level1 = planLevels[plan1] || 0;
  const level2 = planLevels[plan2] || 0;

  return Math.abs(level1 - level2) <= 1;
}

/**
 * 従業員数が近いかどうかを判定
 */
function isSimilarEmployeeCount(count1: string | undefined, count2: string): boolean {
  if (!count1) return true;

  const sizeMap: { [key: string]: number } = {
    '1～10人': 1,
    '11～50人': 2,
    '51～100人': 3,
    '101～500人': 4,
    '501～1000人': 5,
    '1001～5000人': 6,
    '5001人以上': 7,
  };

  const size1 = sizeMap[count1] || 0;
  const size2 = sizeMap[count2] || 0;

  return Math.abs(size1 - size2) <= 1;
}
