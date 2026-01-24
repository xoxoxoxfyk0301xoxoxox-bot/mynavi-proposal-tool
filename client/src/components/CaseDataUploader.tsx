import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { parseCaseDataFromCSV, CaseData } from '@/lib/caseDataMatcher';
import * as XLSX from 'xlsx';

interface CaseDataUploaderProps {
  onDataLoaded: (data: CaseData[]) => void;
  onDataCleared: () => void;
  isLoaded: boolean;
}

export default function CaseDataUploader({
  onDataLoaded,
  onDataCleared,
  isLoaded,
}: CaseDataUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // ExcelファイルをJSONに変換
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // CSVに変換
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      // CaseDataに解析
      const caseData = parseCaseDataFromCSV(csv);
      
      if (caseData.length === 0) {
        setError('ファイルにデータが含まれていません');
        setIsLoading(false);
        return;
      }

      onDataLoaded(caseData);
      setIsLoading(false);
    } catch (err) {
      setError('ファイルの読み込みに失敗しました。Excelファイルを確認してください。');
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    onDataCleared();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          掲載実績データ
        </CardTitle>
        <CardDescription>
          Excelファイルをアップロードして他社事例を表示
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoaded ? (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  読み込み中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Excelファイルを選択
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              必要な列：職種名、企画、職種コード、PV数、応募数、勤務地、経験者フラグ、年収コード、従業員数
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-foreground">
                  ✓ データが読み込まれました
                </span>
              </div>
            </div>

            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              データをクリア
            </Button>

            <p className="text-xs text-muted-foreground">
              アップロード済みのデータを使用して他社事例を表示しています。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
