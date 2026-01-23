import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalOutput, ProposalInput } from '@/lib/proposalEngine';
import { CheckCircle2, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import ProposalLogicExplainer from './ProposalLogicExplainer';

interface ProposalResultProps {
  proposal: ProposalOutput;
  input: ProposalInput;
}

export default function ProposalResult({ proposal, input }: ProposalResultProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const difficultyPercentage = Math.min((proposal.reasoning.difficultyScore / 5) * 100, 100);

  // 難易度の詳細説明
  const getDifficultyLabel = (value: number) => {
    if (value <= 1) return '低い';
    if (value <= 1.5) return '低～中';
    if (value <= 2) return '中';
    if (value <= 2.5) return '中～高';
    return '高い';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 提案ロジック説明 */}
      <ProposalLogicExplainer input={input} proposal={proposal} />

      {/* 選定理由（詳細） */}
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
                {proposal.reasoning.difficultyScore.toFixed(2)} / 5.0
              </span>
            </div>
          </div>

          {/* 難易度の詳細内訳 */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="text-xs">
              <p className="text-muted-foreground">採用ターゲット難易度</p>
              <p className="font-semibold text-foreground">{proposal.reasoning.difficultyBreakdown.target.toFixed(2)}</p>
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground">採用人数難易度</p>
              <p className="font-semibold text-foreground">{proposal.reasoning.difficultyBreakdown.count.toFixed(2)}</p>
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground">職種難易度</p>
              <p className="font-semibold text-foreground">{proposal.reasoning.difficultyBreakdown.jobType.toFixed(2)}</p>
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground">採用時期難易度</p>
              <p className="font-semibold text-foreground">{proposal.reasoning.difficultyBreakdown.period.toFixed(2)}</p>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed pt-2">
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

      {/* チケットプラン */}
      {proposal.ticketPlans.length > 0 && (
        <Card className="card-elevated border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              チケットプラン（長期掲載）
            </CardTitle>
            <CardDescription>複数クール掲載で割引が適用されます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposal.ticketPlans.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">{ticket.name}</p>
                    <p className="text-xs text-muted-foreground">掲載期間：{ticket.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary font-mono">{formatPrice(ticket.price)}</p>
                    <Badge variant="secondary" className="mt-1">
                      {ticket.savingsPercentage}%割引
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
              💡 {proposal.reasoning.ticketRecommendation}
            </p>
          </CardContent>
        </Card>
      )}

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
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            金額サマリー
          </CardTitle>
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
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-2">
        <p>
          ※ この提案は入力情報に基づいた自動提案です。実際の提案内容はマイナビ転職の担当者と相談の上、決定してください。
        </p>
        <p>
          💡 上部の「提案ロジックの詳細説明」をクリックすると、プラン選定ルールと難易度スコアの計算方法が表示されます。
        </p>
      </div>
    </div>
  );
}
