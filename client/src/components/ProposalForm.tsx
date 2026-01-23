import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProposalInput } from '@/lib/proposalEngine';
import { useState } from 'react';

interface ProposalFormProps {
  onSubmit: (input: ProposalInput) => void;
  isLoading?: boolean;
}

export default function ProposalForm({ onSubmit, isLoading = false }: ProposalFormProps) {
  const [formData, setFormData] = useState<ProposalInput>({
    companyName: '',
    homepage: '',
    jobType: '',
    location: '',
    hiringCount: 1,
    targetAudience: '',
    desiredHiringPeriod: '',
    budget: 50,
  });

  const handleInputChange = (field: keyof ProposalInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>採用情報入力</CardTitle>
        <CardDescription>
          以下の情報を入力すると、最適な提案内容が自動生成されます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 企業名 */}
          <div className="space-y-2">
            <Label htmlFor="companyName">企業名 *</Label>
            <Input
              id="companyName"
              placeholder="例：株式会社〇〇"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              required
            />
          </div>

          {/* ホームページ */}
          <div className="space-y-2">
            <Label htmlFor="homepage">ホームページ</Label>
            <Input
              id="homepage"
              type="url"
              placeholder="例：https://example.com"
              value={formData.homepage}
              onChange={(e) => handleInputChange('homepage', e.target.value)}
            />
          </div>

          {/* 採用職種 */}
          <div className="space-y-2">
            <Label htmlFor="jobType">採用職種 *</Label>
            <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
              <SelectTrigger id="jobType">
                <SelectValue placeholder="職種を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="営業">営業</SelectItem>
                <SelectItem value="事務">事務</SelectItem>
                <SelectItem value="企画">企画</SelectItem>
                <SelectItem value="技術職">技術職</SelectItem>
                <SelectItem value="エンジニア">エンジニア</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="管理職">管理職</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 勤務地 */}
          <div className="space-y-2">
            <Label htmlFor="location">勤務地 *</Label>
            <Input
              id="location"
              placeholder="例：東京都渋谷区"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          {/* 採用人数 */}
          <div className="space-y-2">
            <Label htmlFor="hiringCount">採用人数 *</Label>
            <Input
              id="hiringCount"
              type="number"
              min="1"
              max="100"
              value={formData.hiringCount}
              onChange={(e) => handleInputChange('hiringCount', parseInt(e.target.value))}
              required
            />
          </div>

          {/* 採用ターゲット */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">採用ターゲット *</Label>
            <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
              <SelectTrigger id="targetAudience">
                <SelectValue placeholder="ターゲットを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="新卒">新卒</SelectItem>
                <SelectItem value="第二新卒">第二新卒</SelectItem>
                <SelectItem value="経験者">経験者</SelectItem>
                <SelectItem value="管理職">管理職</SelectItem>
                <SelectItem value="スペシャリスト">スペシャリスト</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 希望採用時期 */}
          <div className="space-y-2">
            <Label htmlFor="desiredHiringPeriod">希望採用時期 *</Label>
            <Select value={formData.desiredHiringPeriod} onValueChange={(value) => handleInputChange('desiredHiringPeriod', value)}>
              <SelectTrigger id="desiredHiringPeriod">
                <SelectValue placeholder="採用時期を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1ヶ月以内">1ヶ月以内</SelectItem>
                <SelectItem value="1-3ヶ月">1-3ヶ月</SelectItem>
                <SelectItem value="3-6ヶ月">3-6ヶ月</SelectItem>
                <SelectItem value="6ヶ月以上">6ヶ月以上</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 予算 */}
          <div className="space-y-2">
            <Label htmlFor="budget">予算（万円） *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="budget"
                type="number"
                min="20"
                max="500"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                required
              />
              <span className="text-sm text-muted-foreground">万円</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? '生成中...' : '提案を生成'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
