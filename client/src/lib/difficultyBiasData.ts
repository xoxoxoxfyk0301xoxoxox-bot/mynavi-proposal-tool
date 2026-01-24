/**
 * 難易度バイアスデータ
 * 都道府県別有効求人倍率と職種別有効求人倍率に基づく
 * 参考: JIL(労働政策研究・研修機構)、厚生労働省大阪労働局
 */

/**
 * 都道府県別の難易度係数
 * 有効求人倍率が高いほど採用が難しい
 * 基準値: 全国平均1.25を1.0とする
 */
export const prefectureDifficultyMultipliers: Record<string, number> = {
  // 低難易度地域（1.0以下）
  北海道: 0.85,
  東京都: 0.90,
  神奈川県: 0.89,
  大阪府: 0.86,
  福岡県: 0.87,
  沖縄県: 0.87,

  // 中難易度地域（1.0～1.2）
  青森県: 0.98,
  宮城県: 0.98,
  栃木県: 1.06,
  埼玉県: 0.97,
  千葉県: 1.02,
  静岡県: 1.00,
  愛知県: 1.01,
  兵庫県: 0.90,
  和歌山県: 0.99,
  高知県: 0.94,
  鹿児島県: 0.95,

  // 高難易度地域（1.2～1.5）
  岩手県: 1.04,
  秋田県: 1.12,
  山形県: 1.22,
  福島県: 1.14,
  茨城県: 1.22,
  群馬県: 1.14,
  新潟県: 1.20,
  富山県: 1.26,
  石川県: 1.22,
  山梨県: 1.20,
  長野県: 1.14,
  岐阜県: 1.25,
  三重県: 1.07,
  滋賀県: 1.04,
  京都府: 1.01,
  奈良県: 1.10,
  鳥取県: 1.22,
  島根県: 1.23,
  岡山県: 1.14,
  広島県: 1.05,
  佐賀県: 1.18,
  長崎県: 1.08,
  熊本県: 1.10,
  大分県: 1.23,
  宮崎県: 1.11,

  // 超高難易度地域（1.5以上）
  山口県: 1.32,
  香川県: 1.30,
  福井県: 1.48,
};

/**
 * 職種別の難易度係数
 * 有効求人倍率が高いほど採用が難しい
 * 基準値: 全国平均1.25を1.0とする
 */
export const jobTypeDifficultyMultipliers: Record<string, number> = {
  // 超低難易度（事務職は供給過剰）
  事務: 0.28,
  営業事務: 0.28,
  経理事務: 0.28,
  総務事務: 0.28,

  // 低難易度（販売職）
  販売: 0.73,
  営業サポート: 0.73,
  店舗スタッフ: 0.73,

  // 中難易度
  営業: 0.92,
  サービス: 0.99,
  製造: 1.23,
  生産工程: 1.23,
  企画: 1.00,
  マーケティング: 1.00,

  // 高難易度
  輸送: 1.32,
  機械運転: 1.32,
  農業: 1.51,
  漁業: 1.51,
  運搬: 1.51,
  清掃: 1.51,
  建設: 1.87,
  施工管理: 1.87,
  管理職: 1.01,

  // 超高難易度（技術職）
  SE: 1.72,
  プログラマー: 1.72,
  システム管理: 1.72,
  ネットワーク: 1.72,
  データベース: 1.72,
  Webデザイナー: 1.39,
  グラフィックデザイナー: 1.39,
  研究開発: 1.51,
  コンサルタント: 1.51,
  専門職: 1.51,
};

/**
 * 勤務地から都道府県を推定
 */
export function extractPrefectureFromLocation(location: string): string | null {
  const prefectures = Object.keys(prefectureDifficultyMultipliers);
  for (const pref of prefectures) {
    if (location.includes(pref)) {
      return pref;
    }
  }
  return null;
}

/**
 * 職種から難易度係数を取得
 */
export function getJobTypeDifficultyMultiplier(jobType: string): number {
  // 完全一致
  if (jobTypeDifficultyMultipliers[jobType]) {
    return jobTypeDifficultyMultipliers[jobType];
  }

  // 部分一致
  for (const [key, value] of Object.entries(jobTypeDifficultyMultipliers)) {
    if (jobType.includes(key) || key.includes(jobType)) {
      return value;
    }
  }

  // デフォルト値（中難易度）
  return 1.0;
}

/**
 * 勤務地から難易度係数を取得
 */
export function getLocationDifficultyMultiplier(location: string): number {
  const prefecture = extractPrefectureFromLocation(location);
  if (prefecture && prefectureDifficultyMultipliers[prefecture]) {
    return prefectureDifficultyMultipliers[prefecture];
  }
  // デフォルト値（全国平均）
  return 1.0;
}

/**
 * 職種と勤務地から総合的な難易度係数を計算
 */
export function calculateLocationAndJobTypeBias(
  jobType: string,
  location: string
): { jobTypeBias: number; locationBias: number; combinedBias: number } {
  const jobTypeBias = getJobTypeDifficultyMultiplier(jobType);
  const locationBias = getLocationDifficultyMultiplier(location);

  // 職種と地域の係数を組み合わせ（乗算）
  // 両方が高い場合はさらに難易度が上がる
  const combinedBias = jobTypeBias * locationBias;

  return {
    jobTypeBias,
    locationBias,
    combinedBias,
  };
}
