import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchedCase } from '@/lib/caseDataMatcher';
import { TrendingUp, Users } from 'lucide-react';

interface CaseExamplesProps {
  cases: MatchedCase[];
  isLoading?: boolean;
}

export default function CaseExamples({ cases, isLoading = false }: CaseExamplesProps) {
  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            他社事例
          </CardTitle>
          <CardDescription>データを読み込み中...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            他社事例
          </CardTitle>
          <CardDescription>
            Excelファイルをアップロードすると、類似条件の他社事例が表示されます
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          他社事例（類似条件企業）
        </CardTitle>
        <CardDescription>
          類似した条件の企業における掲載実績
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases.map((matchedCase, idx) => (
          <div
            key={idx}
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {matchedCase.caseData.jobType}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {matchedCase.caseData.plan}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {matchedCase.caseData.location}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {matchedCase.caseData.experienceFlag}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">マッチ度</p>
                <p className="text-lg font-bold text-primary">
                  {matchedCase.matchScore}%
                </p>
              </div>
            </div>

            {/* 実績データ */}
            <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-muted/30 rounded">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  PV数
                </p>
                <p className="text-lg font-bold text-foreground">
                  {matchedCase.caseData.pvCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  応募数
                </p>
                <p className="text-lg font-bold text-foreground">
                  {matchedCase.caseData.applicationCount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* マッチ理由 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground mb-1">マッチ理由：</p>
              {matchedCase.matchReasons.map((reason, reasonIdx) => (
                <p key={reasonIdx} className="ml-2">
                  • {reason}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* 注釈 */}
        <div className="text-xs text-muted-foreground bg-accent/10 rounded-lg p-3 border border-accent/20 mt-4">
          <p>
            💡 これらの事例は、入力条件に基づいて自動抽出された類似企業の掲載実績です。
            参考情報として、提案の効果を推定する際にご活用ください。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
