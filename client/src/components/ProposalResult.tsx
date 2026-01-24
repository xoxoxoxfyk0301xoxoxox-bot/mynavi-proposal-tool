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
    }).format(price * 10000);
  };

  const difficultyPercentage = Math.min((proposal.difficultyScore / 5) * 100, 100);

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
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${difficultyPercentage}%` }}
                />
              </div>
              <span className="text-lg font-bold text-primary">
                {proposal.difficultyScore.toFixed(1)}/5.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {getDifficultyLabel(proposal.difficultyScore)}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">難易度の内訳：</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">ターゲット：</span>
                <span className="font-semibold ml-1">
                  {proposal.difficultyBreakdown.targetAudienceDifficulty.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">採用人数：</span>
                <span className="font-semibold ml-1">
                  {proposal.difficultyBreakdown.hiringCountDifficulty.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">職種：</span>
                <span className="font-semibold ml-1">
                  {proposal.difficultyBreakdown.jobTypeDifficulty.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">採用時期：</span>
                <span className="font-semibold ml-1">
                  {proposal.difficultyBreakdown.dateUrgencyDifficulty.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-sm text-foreground whitespace-pre-line">
              {proposal.selectionReason}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 推奨プラン */}
      <Card className="card-elevated border-l-4 border-l-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            推奨プラン
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-foreground">{proposal.plan.name}</h3>
              <Badge variant="secondary">{proposal.plan.price}万円</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{proposal.plan.description}</p>
          </div>

          {/* オプション */}
          {proposal.options.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">推奨オプション</p>
              <div className="space-y-2">
                {proposal.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{option.name}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <span className="font-semibold text-primary ml-2">+{option.price}万円</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* キャンペーン情報 */}
          {proposal.appliedCampaigns.length > 0 && (
            <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                🎉 適用可能なキャンペーン
              </p>
              {proposal.appliedCampaigns.map((campaign, idx) => (
                <div key={idx} className="text-xs text-green-800 dark:text-green-200">
                  <p className="font-semibold">{campaign.name}</p>
                  <p>{campaign.description}</p>
                  {campaign.discountType === 'percentage' ? (
                    <p>割引：{campaign.discountValue}%</p>
                  ) : (
                    <p>割引：{campaign.discountValue}万円</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* チケットプラン */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            チケットプラン（長期掲載割引）
          </CardTitle>
          <CardDescription>
            複数クール掲載で1クール当たりの料金を削減できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '2クール', data: proposal.ticketPlans.twoWeeks },
              { label: '3クール', data: proposal.ticketPlans.threeWeeks },
              { label: '6クール', data: proposal.ticketPlans.sixWeeks },
              { label: '12クール', data: proposal.ticketPlans.twelveWeeks },
            ].map((ticket, idx) => (
              <div
                key={idx}
                className="p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <p className="text-sm font-semibold text-foreground mb-1">{ticket.label}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {formatPrice(ticket.data.price)}
                </p>
                {ticket.data.discount > 0 && (
                  <>
                    <p className="text-xs line-through text-muted-foreground">
                      {formatPrice(ticket.data.price)}
                    </p>
                    <p className="text-sm font-bold text-accent">
                      {formatPrice(ticket.data.discountedPrice)}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {Math.round((ticket.data.discount / ticket.data.price) * 100)}%割引
                    </Badge>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 料金詳細 */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            料金詳細
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">基本プラン</span>
            <span className="font-semibold font-mono">
              {formatPrice(proposal.plan.price)}
            </span>
          </div>
          {proposal.options.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">オプション料金</span>
              <span className="font-semibold font-mono">
                {formatPrice(proposal.options.reduce((sum, opt) => sum + opt.price, 0))}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-primary/20 flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">小計（税抜）</span>
            <span className="font-semibold font-mono">
              {formatPrice(proposal.totalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">消費税（10%）</span>
            <span className="font-semibold font-mono">
              {formatPrice((proposal.totalPriceWithTax - proposal.totalPrice))}
            </span>
          </div>
          <div className="pt-3 border-t border-primary/20 flex justify-between items-center bg-primary/10 rounded-lg p-3">
            <span className="font-bold text-foreground">合計（税込）</span>
            <span className="text-2xl font-bold text-primary font-mono">
              {formatPrice(proposal.totalPriceWithTax)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 注釈 */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border">
        <p>
          💡 このツールは参考情報です。実際の掲載プランはマイナビ転職の担当者にご相談ください。
        </p>
      </div>
    </div>
  );
}
