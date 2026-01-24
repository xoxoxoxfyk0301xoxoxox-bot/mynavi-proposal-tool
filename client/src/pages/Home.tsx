import { useState, useEffect } from 'react';
import ProposalForm from '@/components/ProposalForm';
import ProposalResult from '@/components/ProposalResult';
import CaseExamples from '@/components/CaseExamples';
import { ProposalInput, ProposalOutput, generateProposal } from '@/lib/proposalEngine';
import { CaseData, findMatchedCases, MatchedCase } from '@/lib/caseDataMatcher';
import { useCaseData } from '@/hooks/useCaseData';
import { Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Home() {
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [input, setInput] = useState<ProposalInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [matchedCases, setMatchedCases] = useState<MatchedCase[]>([]);
  const { caseData, isLoading: isCaseDataLoading } = useCaseData();
  const [, navigate] = useLocation();

  const handleGenerateProposal = (formInput: ProposalInput) => {
    setIsLoading(true);
    setInput(formInput);
    // Simulate async operation
    setTimeout(() => {
      const result = generateProposal(formInput);
      setProposal(result);

      // 他社事例を検索
      if (caseData.length > 0) {
        const matched = findMatchedCases(formInput, caseData, result.plan.name, 3);
        setMatchedCases(matched);
      } else {
        setMatchedCases([]);
      }

      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">マイナビ転職 提案自動化ツール</h1>
                <p className="text-xs text-muted-foreground">採用情報から最適な掲載プランを自動提案</p>
              </div>
            </div>

            {/* 管理画面へのリンク */}
            <Button
              onClick={() => navigate('/admin/case-data')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              管理画面
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：入力フォーム */}
          <div className="lg:sticky lg:top-24 lg:h-fit space-y-6">
            <div className="form-gradient rounded-xl p-6">
              <ProposalForm onSubmit={handleGenerateProposal} isLoading={isLoading} />
            </div>

            {/* データ状態表示 */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border text-sm">
              {isCaseDataLoading ? (
                <p className="text-muted-foreground">事例データを読み込み中...</p>
              ) : caseData.length > 0 ? (
                <p className="text-accent font-semibold">
                  ✓ {caseData.length}件の事例データが利用可能です
                </p>
              ) : (
                <p className="text-muted-foreground">
                  事例データが登録されていません
                </p>
              )}
            </div>
          </div>

          {/* 右側：提案結果 */}
          <div className="space-y-6">
            {proposal && input ? (
              <>
                <ProposalResult proposal={proposal} input={input} />

                {/* 他社事例 */}
                <CaseExamples cases={matchedCases} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  提案を生成してください
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  左側のフォームに採用情報を入力すると、最適なマイナビ転職のプランとオプションが自動提案されます。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-border bg-muted/30 mt-12">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 マイナビ転職 提案自動化ツール</p>
            <p className="mt-2">
              このツールは参考情報です。実際の掲載プランはマイナビ転職の担当者にご相談ください。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
