import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalInput, MultiProposalOutput } from '@/lib/proposalEngine';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import ProposalResult from './ProposalResult';

interface MultiProposalComparisonProps {
  input: ProposalInput;
  proposals: MultiProposalOutput;
}

export default function MultiProposalComparison({ input, proposals }: MultiProposalComparisonProps) {
  const plans = [
    {
      title: '採用確度最優先プラン',
      description: '予算を度外視し、採用確度を最大化するプラン',
      proposal: proposals.highConversionPlan,
      icon: TrendingUp,
      color: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-900',
      recommendation: '採用確度を最優先にしたい場合に選択',
    },
    {
      title: '推奨プラン',
      description: '難易度と予算のバランスを考慮した最適なプラン',
      proposal: proposals.recommendedPlan,
      icon: Target,
      color: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-900',
      recommendation: 'バランスの取れた提案',
    },
    {
      title: '予算最適化プラン',
      description: `予算内（${input.budget}万円）で最適なプラン`,
      proposal: proposals.budgetOptimizedPlan,
      icon: DollarSign,
      color: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-900',
      recommendation: '予算を重視したい場合に選択',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const budgetDiff = plan.proposal.totalPrice - input.budget;
          const isOverBudget = budgetDiff > 0;

          return (
            <Card key={idx} className={`border-2 ${plan.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {plan.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">企画</span>
                    <Badge className={plan.badge}>
                      {plan.proposal.plan.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">基本料金</span>
                    <span className="font-semibold">
                      {plan.proposal.plan.price}万円
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">合計金額（税抜）</span>
                    <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {plan.proposal.totalPrice.toFixed(1)}万円
                    </span>
                  </div>
                  {isOverBudget && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      予算超過：+{budgetDiff.toFixed(1)}万円
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">難易度スコア</span>
                    <span className="font-semibold">
                      {plan.proposal.difficultyScore.toFixed(2)}/5.0
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    {plan.recommendation}
                  </p>
                  {plan.proposal.options.length > 0 && (
                    <div className="text-xs">
                      <p className="font-semibold text-foreground mb-1">推奨オプション：</p>
                      <div className="space-y-1">
                        {plan.proposal.options.map((opt, i) => (
                          <div key={i} className="flex justify-between text-muted-foreground">
                            <span>• {opt.name}</span>
                            <span>{opt.price}万円</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 詳細比較 */}
      <Card>
        <CardHeader>
          <CardTitle>詳細比較</CardTitle>
          <CardDescription>各プランの詳細情報を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {plans.map((plan, idx) => (
              <div key={idx} className="pb-8 border-b last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  {plan.title}
                  <Badge className={plan.badge}>{plan.proposal.plan.name}</Badge>
                </h3>
                <ProposalResult proposal={plan.proposal} input={input} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
