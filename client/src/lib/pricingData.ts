/**
 * 料金表データの型定義
 */
export interface PricingData {
  plan: string;           // 企画（MT-S, MT-A, MT-B, MT-C, MT-D）
  basePricePerWeek: number; // 1週間当たりの基本料金（万円）
  searchRank: string;     // 検索順位
  features: string[];     // 機能
}

/**
 * チケット料金データの型定義
 */
export interface TicketPricingData {
  plan: string;           // 企画（MT-S, MT-A, MT-B, MT-C, MT-D）
  twoWeeks: number;       // 2クール料金（万円）
  threeWeeks: number;     // 3クール料金（万円）
  sixWeeks: number;       // 6クール料金（万円）
  twelveWeeks: number;    // 12クール料金（万円）
}

/**
 * オプション料金データの型定義
 */
export interface OptionPricingData {
  id: string;             // オプションID
  name: string;           // オプション名
  price: number;          // 料金（万円）
  description: string;    // 説明
  features: string[];     // 機能
  applicablePlans: string[]; // 適用可能な企画
}

/**
 * キャンペーンデータの型定義
 */
export interface CampaignData {
  id: string;             // キャンペーンID
  name: string;           // キャンペーン名
  description: string;    // 説明
  discountType: 'percentage' | 'fixed'; // 割引タイプ（パーセンテージ or 固定額）
  discountValue: number;  // 割引値
  applicablePlans: string[]; // 適用可能な企画
  startDate: string;      // 開始日（YYYY-MM-DD）
  endDate: string;        // 終了日（YYYY-MM-DD）
  isActive: boolean;      // 有効フラグ
}

/**
 * 料金表をCSVから解析
 */
export function parsePricingDataFromCSV(csvText: string): PricingData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const planIdx = headers.findIndex(h => h.includes('企画'));
  const priceIdx = headers.findIndex(h => h.includes('基本料金'));
  const rankIdx = headers.findIndex(h => h.includes('検索順位'));
  const featuresIdx = headers.findIndex(h => h.includes('機能'));

  const data: PricingData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    data.push({
      plan: values[planIdx] || '',
      basePricePerWeek: parseInt(values[priceIdx]) || 0,
      searchRank: values[rankIdx] || '',
      features: values[featuresIdx] ? values[featuresIdx].split('|').map(f => f.trim()) : [],
    });
  }

  return data;
}

/**
 * チケット料金をCSVから解析
 */
export function parseTicketPricingFromCSV(csvText: string): TicketPricingData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const planIdx = headers.findIndex(h => h.includes('企画'));
  const twoIdx = headers.findIndex(h => h.includes('2クール'));
  const threeIdx = headers.findIndex(h => h.includes('3クール'));
  const sixIdx = headers.findIndex(h => h.includes('6クール'));
  const twelveIdx = headers.findIndex(h => h.includes('12クール'));

  const data: TicketPricingData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    data.push({
      plan: values[planIdx] || '',
      twoWeeks: parseInt(values[twoIdx]) || 0,
      threeWeeks: parseInt(values[threeIdx]) || 0,
      sixWeeks: parseInt(values[sixIdx]) || 0,
      twelveWeeks: parseInt(values[twelveIdx]) || 0,
    });
  }

  return data;
}

/**
 * オプション料金をCSVから解析
 */
export function parseOptionPricingFromCSV(csvText: string): OptionPricingData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const idIdx = headers.findIndex(h => h.includes('ID'));
  const nameIdx = headers.findIndex(h => h.includes('名前'));
  const priceIdx = headers.findIndex(h => h.includes('料金'));
  const descIdx = headers.findIndex(h => h.includes('説明'));
  const featuresIdx = headers.findIndex(h => h.includes('機能'));
  const plansIdx = headers.findIndex(h => h.includes('適用企画'));

  const data: OptionPricingData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    data.push({
      id: values[idIdx] || '',
      name: values[nameIdx] || '',
      price: parseInt(values[priceIdx]) || 0,
      description: values[descIdx] || '',
      features: values[featuresIdx] ? values[featuresIdx].split('|').map(f => f.trim()) : [],
      applicablePlans: values[plansIdx] ? values[plansIdx].split('|').map(p => p.trim()) : [],
    });
  }

  return data;
}

/**
 * キャンペーンをCSVから解析
 */
export function parseCampaignDataFromCSV(csvText: string): CampaignData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const idIdx = headers.findIndex(h => h.includes('ID'));
  const nameIdx = headers.findIndex(h => h.includes('名前'));
  const descIdx = headers.findIndex(h => h.includes('説明'));
  const typeIdx = headers.findIndex(h => h.includes('割引タイプ'));
  const valueIdx = headers.findIndex(h => h.includes('割引値'));
  const plansIdx = headers.findIndex(h => h.includes('適用企画'));
  const startIdx = headers.findIndex(h => h.includes('開始日'));
  const endIdx = headers.findIndex(h => h.includes('終了日'));
  const activeIdx = headers.findIndex(h => h.includes('有効'));

  const data: CampaignData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    const discountType = values[typeIdx]?.toLowerCase() === 'percentage' ? 'percentage' : 'fixed';

    data.push({
      id: values[idIdx] || '',
      name: values[nameIdx] || '',
      description: values[descIdx] || '',
      discountType,
      discountValue: parseInt(values[valueIdx]) || 0,
      applicablePlans: values[plansIdx] ? values[plansIdx].split('|').map(p => p.trim()) : [],
      startDate: values[startIdx] || '',
      endDate: values[endIdx] || '',
      isActive: values[activeIdx]?.toLowerCase() === 'true' || values[activeIdx] === '1',
    });
  }

  return data;
}

/**
 * 有効なキャンペーンを取得
 */
export function getActiveCampaigns(campaigns: CampaignData[]): CampaignData[] {
  const today = new Date().toISOString().split('T')[0];
  return campaigns.filter(
    c => c.isActive && c.startDate <= today && c.endDate >= today
  );
}

/**
 * 企画に適用可能なキャンペーンを取得
 */
export function getApplicableCampaigns(
  campaigns: CampaignData[],
  plan: string
): CampaignData[] {
  return getActiveCampaigns(campaigns).filter(c =>
    c.applicablePlans.includes(plan) || c.applicablePlans.includes('全企画')
  );
}
