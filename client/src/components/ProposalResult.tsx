import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalOutput } from '@/lib/proposalEngine';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface ProposalResultProps {
  proposal: ProposalOutput;
}

export default function ProposalResult({ proposal }: ProposalResultProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const difficultyPercentage = Math.min((proposal.reasoning.difficultyScore / 5) * 100, 100);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 選定理由 */}
      <Card className="card-elevated border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            提案理由
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">採用難易度スコア</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                  style={{ width: `${difficultyPercentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground min-w-fit">
                {proposal.reasoning.difficultyScore.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {proposal.reasoning.selectedReason}
          </p>
        </CardContent>
      </Card>

      {/* 基本企画 */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>基本企画</CardTitle>
          <CardDescription>推奨プラン</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-primary">{proposal.plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">掲載期間：{proposal.plan.period}</p>
              <p className="text-sm text-muted-foreground">検索順位：{proposal.plan.searchRank}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary font-mono">
                {formatPrice(proposal.plan.price)}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-semibold text-foreground mb-3">掲載可能な機能</p>
            <div className="space-y-2">
              {proposal.plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* オプション */}
      {proposal.options.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>推奨オプション</CardTitle>
            <CardDescription>{proposal.options.length}個のオプションを提案</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposal.options.map((option, idx) => (
                <div key={option.id} className="pb-4 border-b last:pb-0 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{option.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      <span className="font-mono">{formatPrice(option.price)}</span>
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {option.features.map((feature, featureIdx) => (
                      <Badge key={featureIdx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {proposal.reasoning.optionReasons[idx] && (
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 {proposal.reasoning.optionReasons[idx]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 金額サマリー */}
      <Card className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle>金額サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">基本企画料金</span>
              <span className="font-semibold font-mono">
                {formatPrice(proposal.pricing.basePlan)}
              </span>
            </div>
            {proposal.pricing.optionsTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">オプション料金</span>
                <span className="font-semibold font-mono">
                  {formatPrice(proposal.pricing.optionsTotal)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-primary/20 flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">小計（税抜）</span>
              <span className="font-semibold font-mono">
                {formatPrice(proposal.pricing.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">消費税（10%）</span>
              <span className="font-semibold font-mono">
                {formatPrice(proposal.pricing.tax)}
              </span>
            </div>
            <div className="pt-3 border-t border-primary/20 flex justify-between items-center bg-primary/10 rounded-lg p-3">
              <span className="font-bold text-foreground">合計（税込）</span>
              <span className="text-2xl font-bold text-primary font-mono">
                {formatPrice(proposal.pricing.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注釈 */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <p>
          ※ この提案は入力情報に基づいた自動提案です。実際の提案内容はマイナビ転職の担当者と相談の上、決定してください。
        </p>
      </div>
    </div>
  );
}
