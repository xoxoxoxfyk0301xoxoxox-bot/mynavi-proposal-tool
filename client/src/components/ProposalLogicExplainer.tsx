import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalInput, ProposalOutput } from '@/lib/proposalEngine';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ProposalLogicExplainerProps {
  input: ProposalInput;
  proposal: ProposalOutput;
}

export default function ProposalLogicExplainer({ input, proposal }: ProposalLogicExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 難易度スコアの説明
  const getDifficultyExplanation = (score: number) => {
    if (score <= 1.0) return '採用が容易な条件です。最小限のプランでも効果が期待できます。';
    if (score <= 1.5) return '採用がやや容易な条件です。コストを抑えたプランで対応可能です。';
    if (score <= 2.0) return '採用が標準的な難易度です。バランスの取れたプランが最適です。';
    if (score <= 2.5) return '採用がやや難しい条件です。上位プランで露出を強化する必要があります。';
    return '採用が難しい条件です。最上位プランで最大限の露出が必要です。';
  };

  // プラン選定ルールの説明
  const getPlanSelectionRules = () => {
    return [
      {
        condition: '難易度スコア > 2.5 かつ 予算 ≥ 120万円',
        plan: 'MT-S企画',
        reason: '採用難易度が高く、最大限の露出と情報量が必要な場合に選定',
        color: 'bg-blue-100 text-blue-900',
      },
      {
        condition: '難易度スコア > 2.0 かつ 予算 ≥ 75万円',
        plan: 'MT-A企画',
        reason: '採用難易度が中程度以上で、母集団形成に強いプランが必要な場合に選定',
        color: 'bg-cyan-100 text-cyan-900',
      },
      {
        condition: '難易度スコア > 1.5 かつ 予算 ≥ 50万円',
        plan: 'MT-B企画',
        reason: 'コストと露出のバランスが取れたプランが最適な場合に選定',
        color: 'bg-green-100 text-green-900',
      },
      {
        condition: '難易度スコア > 1.0 かつ 予算 ≥ 35万円',
        plan: 'MT-C企画',
        reason: 'コストを抑えながら基本的な採用活動が可能な場合に選定',
        color: 'bg-yellow-100 text-yellow-900',
      },
      {
        condition: 'その他（予算不足など）',
        plan: 'MT-D企画',
        reason: '最小限の予算で急ぎの採用に対応する場合に選定',
        color: 'bg-gray-100 text-gray-900',
      },
    ];
  };

  // 現在のプランがどのルールに該当するか
  const getCurrentRuleIndex = () => {
    const score = proposal.reasoning.difficultyScore;
    const budgetInYen = input.budget * 10000;

    if (budgetInYen >= 1200000 && score > 2.5) return 0;
    if (budgetInYen >= 750000 && score > 2.0) return 1;
    if (budgetInYen >= 500000 && score > 1.5) return 2;
    if (budgetInYen >= 350000 && score > 1.0) return 3;
    return 4;
  };

  const rules = getPlanSelectionRules();
  const currentRuleIndex = getCurrentRuleIndex();
  const budgetInYen = input.budget * 10000;

  return (
    <Card className="card-elevated">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              提案ロジックの詳細説明
            </CardTitle>
            <CardDescription>なぜこのプランが選定されたのか</CardDescription>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 border-t pt-6">
          {/* 難易度スコアの説明 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">1. 採用難易度スコアの計算</h3>
            <p className="text-sm text-muted-foreground">
              以下の4つの要因から採用難易度を計算し、その平均値を難易度スコアとします。
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-1">採用ターゲット</p>
                <p className="text-sm font-bold text-foreground">{proposal.reasoning.difficultyBreakdown.target.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{input.targetAudience}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-1">採用人数</p>
                <p className="text-sm font-bold text-foreground">{proposal.reasoning.difficultyBreakdown.count.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{input.hiringCount}人</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-1">職種</p>
                <p className="text-sm font-bold text-foreground">{proposal.reasoning.difficultyBreakdown.jobType.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{input.jobType}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-1">採用時期</p>
                <p className="text-sm font-bold text-foreground">{proposal.reasoning.difficultyBreakdown.period.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{input.desiredHiringPeriod}</p>
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">難易度スコア（平均値）</p>
              <p className="text-2xl font-bold text-primary">
                {proposal.reasoning.difficultyScore.toFixed(2)} / 5.0
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {getDifficultyExplanation(proposal.reasoning.difficultyScore)}
              </p>
            </div>
          </div>

          {/* プラン選定ルール */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">2. プラン選定ルール</h3>
            <p className="text-sm text-muted-foreground">
              難易度スコアと予算に基づいて、以下のルールでプランを選定します。
            </p>

            <div className="space-y-2">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    idx === currentRuleIndex
                      ? `${rule.color} border-current`
                      : 'bg-muted border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {rule.plan}
                        {idx === currentRuleIndex && (
                          <Badge className="ml-2 bg-current">選定</Badge>
                        )}
                      </p>
                      <p className="text-xs mt-1 opacity-75">条件：{rule.condition}</p>
                      <p className="text-xs mt-1 opacity-75">{rule.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 現在の条件の確認 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">3. 現在の条件確認</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">難易度スコア</p>
                <p className="text-lg font-bold text-foreground">
                  {proposal.reasoning.difficultyScore.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {proposal.reasoning.difficultyScore > 2.5 ? '> 2.5' :
                   proposal.reasoning.difficultyScore > 2.0 ? '> 2.0' :
                   proposal.reasoning.difficultyScore > 1.5 ? '> 1.5' :
                   proposal.reasoning.difficultyScore > 1.0 ? '> 1.0' : '≤ 1.0'}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">予算</p>
                <p className="text-lg font-bold text-foreground">
                  {input.budget}万円
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetInYen >= 1200000 ? '≥ 120万円' :
                   budgetInYen >= 750000 ? '≥ 75万円' :
                   budgetInYen >= 500000 ? '≥ 50万円' :
                   budgetInYen >= 350000 ? '≥ 35万円' : '< 35万円'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm font-semibold text-foreground mb-2">
                ✓ 選定されたプラン：{proposal.plan.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {proposal.reasoning.selectedReason}
              </p>
            </div>
          </div>

          {/* 難易度スコアの詳細説明 */}
          <div className="space-y-3 pt-3 border-t">
            <h3 className="font-semibold text-foreground">4. 難易度スコアの詳細ルール</h3>

            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-1">採用ターゲット別難易度</p>
                <div className="text-xs text-muted-foreground space-y-1 ml-2">
                  <p>• 新卒：1.0（採用が容易）</p>
                  <p>• 第二新卒：2.0（採用が標準的）</p>
                  <p>• 経験者：3.0（採用がやや難しい）</p>
                  <p>• 管理職：4.0（採用が難しい）</p>
                  <p>• スペシャリスト：5.0（採用が最も難しい）</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">採用人数別難易度</p>
                <div className="text-xs text-muted-foreground space-y-1 ml-2">
                  <p>• 1人：1.0</p>
                  <p>• 2～3人：1.5</p>
                  <p>• 4～5人：2.0</p>
                  <p>• 6～10人：2.5</p>
                  <p>• 11人以上：3.0</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">職種別難易度</p>
                <div className="text-xs text-muted-foreground space-y-1 ml-2">
                  <p>• 営業：1.0（採用が容易）</p>
                  <p>• 事務：1.2</p>
                  <p>• 企画：1.5</p>
                  <p>• 技術職・エンジニア・IT：2.0（採用が難しい）</p>
                  <p>• 管理職：2.5（採用が最も難しい）</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">採用時期別難易度</p>
                <div className="text-xs text-muted-foreground space-y-1 ml-2">
                  <p>• 1ヶ月以内：1.5（採用が急ぐ）</p>
                  <p>• 1～3ヶ月：1.3</p>
                  <p>• 3～6ヶ月：1.0（採用が標準的）</p>
                  <p>• 6ヶ月以上：0.8（採用に余裕がある）</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
