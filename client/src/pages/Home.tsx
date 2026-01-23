import { useState } from 'react';
import ProposalForm from '@/components/ProposalForm';
import ProposalResult from '@/components/ProposalResult';
import { ProposalInput, ProposalOutput, generateProposal } from '@/lib/proposalEngine';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateProposal = (input: ProposalInput) => {
    setIsLoading(true);
    // Simulate async operation
    setTimeout(() => {
      const result = generateProposal(input);
      setProposal(result);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">マイナビ転職 提案自動化ツール</h1>
              <p className="text-xs text-muted-foreground">採用情報から最適な掲載プランを自動提案</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：入力フォーム */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="form-gradient rounded-xl p-6">
              <ProposalForm onSubmit={handleGenerateProposal} isLoading={isLoading} />
            </div>
          </div>

          {/* 右側：提案結果 */}
          <div>
            {proposal ? (
              <ProposalResult proposal={proposal} />
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
