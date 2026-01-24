import { useState, useEffect } from 'react';
import { CaseData } from '@/lib/caseDataMatcher';

/**
 * ローカルストレージから事例データを読み込むカスタムフック
 */
export function useCaseData() {
  const [caseData, setCaseData] = useState<CaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージから事例データを読み込む
    const stored = localStorage.getItem('adminCaseData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCaseData(parsed);
      } catch (err) {
        console.error('Failed to parse case data:', err);
      }
    }
    setIsLoading(false);
  }, []);

  return { caseData, isLoading };
}
