/**
 * マイナビ転職の職種・業種マスターデータ
 */

export const OCCUPATIONS = [
  { id: 'sales', label: '営業' },
  { id: 'sales_support', label: '営業サポート・営業事務' },
  { id: 'sales_planning', label: '営業企画' },
  { id: 'planning', label: '企画' },
  { id: 'product_planning', label: '商品企画' },
  { id: 'marketing', label: 'マーケティング' },
  { id: 'office_work', label: '事務' },
  { id: 'accounting', label: '経理・財務' },
  { id: 'hr', label: '人事' },
  { id: 'legal', label: '法務' },
  { id: 'se', label: 'SE・プログラマー' },
  { id: 'system_admin', label: 'システム管理・運用' },
  { id: 'network', label: 'ネットワーク・サーバー' },
  { id: 'database', label: 'データベース' },
  { id: 'web_designer', label: 'Webデザイナー' },
  { id: 'graphic_designer', label: 'グラフィックデザイナー' },
  { id: 'ui_ux_designer', label: 'UI/UXデザイナー' },
  { id: 'consultant', label: 'コンサルタント' },
  { id: 'research_development', label: '研究開発' },
  { id: 'manufacturing', label: '製造・生産技術' },
  { id: 'quality_control', label: '品質管理' },
  { id: 'construction_management', label: '施工管理' },
  { id: 'sales_engineer', label: '営業技術' },
  { id: 'customer_support', label: 'カスタマーサポート' },
  { id: 'call_center', label: 'コールセンター' },
  { id: 'medical_office', label: '医療事務' },
  { id: 'logistics', label: '物流・配送' },
  { id: 'procurement', label: '購買・調達' },
  { id: 'finance', label: 'ファイナンス' },
  { id: 'other', label: 'その他' },
];

export const INDUSTRIES = [
  { id: 'it_telecom', label: 'IT・通信' },
  { id: 'finance_insurance', label: '金融・保険' },
  { id: 'manufacturing', label: '製造' },
  { id: 'construction_realestate', label: '建設・不動産' },
  { id: 'retail_distribution', label: '流通・小売' },
  { id: 'food_beverage', label: '外食・飲食' },
  { id: 'service_other', label: 'サービス・その他' },
  { id: 'medical_welfare', label: '医療・福祉' },
  { id: 'education', label: '教育' },
  { id: 'media_advertising', label: 'メディア・広告' },
  { id: 'transportation_logistics', label: '運輸・物流' },
  { id: 'energy_power', label: 'エネルギー・電力' },
  { id: 'chemical_material', label: '化学・素材' },
  { id: 'food_production', label: '食品・飲料製造' },
  { id: 'agriculture_fishery', label: '農業・漁業' },
  { id: 'public_service', label: '公務員' },
  { id: 'nonprofit', label: '非営利団体・官公庁' },
];

/**
 * 業種から難易度の調整値を取得
 * 採用が難しい業種ほど高い値を返す
 */
export function getIndustryDifficultyModifier(industryId: string): number {
  const modifiers: Record<string, number> = {
    it_telecom: 1.3,           // IT業界は採用難易度が高い
    finance_insurance: 1.2,    // 金融は採用難易度が高い
    manufacturing: 0.9,        // 製造は比較的採用しやすい
    construction_realestate: 0.95,
    retail_distribution: 0.8,  // 小売は採用しやすい
    food_beverage: 0.85,
    service_other: 1.0,
    medical_welfare: 1.1,      // 医療・福祉は採用難易度が中程度
    education: 1.0,
    media_advertising: 1.15,   // メディア・広告は採用難易度が高い
    transportation_logistics: 0.9,
    energy_power: 1.25,        // エネルギーは採用難易度が高い
    chemical_material: 1.1,
    food_production: 0.9,
    agriculture_fishery: 0.85,
    public_service: 1.4,       // 公務員は採用難易度が非常に高い
    nonprofit: 1.0,
  };

  return modifiers[industryId] || 1.0;
}

/**
 * 職種から難易度の調整値を取得
 * スキルが必要な職種ほど高い値を返す
 */
export function getOccupationDifficultyModifier(occupationId: string): number {
  const modifiers: Record<string, number> = {
    sales: 0.9,
    sales_support: 0.7,
    sales_planning: 1.1,
    planning: 1.1,
    product_planning: 1.15,
    marketing: 1.2,
    office_work: 0.6,
    accounting: 0.95,
    hr: 1.0,
    legal: 1.3,
    se: 1.4,                   // SE・プログラマーは採用難易度が非常に高い
    system_admin: 1.2,
    network: 1.25,
    database: 1.3,
    web_designer: 1.15,
    graphic_designer: 1.1,
    ui_ux_designer: 1.2,
    consultant: 1.35,
    research_development: 1.3,
    manufacturing: 1.0,
    quality_control: 1.05,
    construction_management: 1.15,
    sales_engineer: 1.25,
    customer_support: 0.8,
    call_center: 0.6,
    medical_office: 0.85,
    logistics: 0.8,
    procurement: 1.05,
    finance: 1.2,
    other: 1.0,
  };

  return modifiers[occupationId] || 1.0;
}

/**
 * 企業のホームページから業種を推定
 */
export function estimateIndustryFromWebsite(website: string): string | null {
  const url = website.toLowerCase();

  // URLに含まれるキーワードから業種を推定
  const industryPatterns: Record<string, string[]> = {
    it_telecom: ['tech', 'software', 'it', 'cloud', 'ai', 'data', 'digital', 'web', 'app'],
    finance_insurance: ['bank', 'finance', 'insurance', 'securities', 'investment'],
    manufacturing: ['mfg', 'factory', 'manufacturing', 'industrial', 'equipment'],
    construction_realestate: ['real estate', 'realty', 'construction', 'building', 'property'],
    retail_distribution: ['retail', 'store', 'shop', 'distribution', 'commerce'],
    food_beverage: ['restaurant', 'food', 'beverage', 'cafe', 'dining'],
    medical_welfare: ['hospital', 'clinic', 'medical', 'healthcare', 'welfare'],
    education: ['school', 'university', 'education', 'academy'],
    media_advertising: ['media', 'advertising', 'agency', 'broadcast', 'publish'],
    transportation_logistics: ['transport', 'logistics', 'shipping', 'delivery'],
    energy_power: ['energy', 'power', 'electric', 'utility', 'oil', 'gas'],
    chemical_material: ['chemical', 'material', 'pharma', 'pharmaceutical'],
  };

  for (const [industryId, keywords] of Object.entries(industryPatterns)) {
    if (keywords.some(keyword => url.includes(keyword))) {
      return industryId;
    }
  }

  return null;
}
