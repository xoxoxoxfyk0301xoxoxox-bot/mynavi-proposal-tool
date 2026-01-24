import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Trash2, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CaseData } from '@/lib/caseDataMatcher';

export default function AdminCaseData() {
  const [caseData, setCaseData] = useState<CaseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ローカルストレージから事例データを読み込む
  const loadFromStorage = () => {
    const stored = localStorage.getItem('adminCaseData');
    if (stored) {
      try {
        setCaseData(JSON.parse(stored));
      } catch (err) {
        alert('データの読み込みに失敗しました');
      }
    }
  };

  // ローカルストレージに事例データを保存
  const saveToStorage = (data: CaseData[]) => {
    localStorage.setItem('adminCaseData', JSON.stringify(data));
    setCaseData(data);
  };

  // Excelファイルをアップロード
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // JSONに変換
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // CaseDataに変換
      const converted: CaseData[] = jsonData.map((row: any) => ({
        jobType: row['職種名'] || '',
        plan: row['企画'] || '',
        jobCode: row['職種コード'] || '',
        pvCount: parseInt(row['pv数']) || 0,
        applicationCount: parseInt(row['応募数']) || 0,
        location: row['勤務地'] || '',
        experienceFlag: row['経験者フラグ'] || '',
        salaryCode: row['年収コード'] || '',
        employeeCount: row['従業員数'] || '',
      }));

      saveToStorage(converted);
      alert(`${converted.length}件のデータをアップロードしました`);
      setIsLoading(false);
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  // データをCSVでダウンロード
  const handleDownload = () => {
    if (caseData.length === 0) {
      alert('ダウンロードするデータがありません');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(caseData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CaseData');
    XLSX.writeFile(wb, 'case_data.xlsx');
  };

  // データをクリア
  const handleClear = () => {
    if (window.confirm('すべてのデータを削除してもよろしいですか？')) {
      saveToStorage([]);
      alert('データを削除しました');
    }
  };

  // 行を削除
  const handleDeleteRow = (index: number) => {
    const updated = caseData.filter((_, i) => i !== index);
    saveToStorage(updated);
  };

  // 行を追加
  const handleAddRow = () => {
    const newRow: CaseData = {
      jobType: '',
      plan: 'MT-B',
      jobCode: '',
      pvCount: 0,
      applicationCount: 0,
      location: '',
      experienceFlag: '未経験者',
      salaryCode: '',
      employeeCount: '',
    };
    saveToStorage([...caseData, newRow]);
  };

  // セルを更新
  const handleCellChange = (index: number, field: keyof CaseData, value: any) => {
    const updated = [...caseData];
    updated[index] = { ...updated[index], [field]: value };
    saveToStorage(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-foreground">
            管理画面 - 掲載実績データ管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            事例データをアップロードして、利用者に提示する情報を管理します
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container py-8">
        {/* コントロールパネル */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>データ管理</CardTitle>
            <CardDescription>
              Excelファイルをアップロードするか、手動でデータを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => document.getElementById('fileInput')?.click()}
                disabled={isLoading}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {isLoading ? 'アップロード中...' : 'Excelをアップロード'}
              </Button>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                データをダウンロード
              </Button>

              <Button
                onClick={handleAddRow}
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                行を追加
              </Button>

              <Button
                onClick={handleClear}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                すべて削除
              </Button>
            </div>

            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              <p className="font-semibold mb-2">必要な列：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>職種名</li>
                <li>企画（MT-S, MT-A, MT-B, MT-C, MT-D）</li>
                <li>職種コード</li>
                <li>PV数</li>
                <li>応募数</li>
                <li>勤務地</li>
                <li>経験者フラグ（経験者/未経験者）</li>
                <li>年収コード</li>
                <li>従業員数</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* データテーブル */}
        <Card>
          <CardHeader>
            <CardTitle>登録済みデータ</CardTitle>
            <CardDescription>
              {caseData.length}件のデータが登録されています
            </CardDescription>
          </CardHeader>
          <CardContent>
            {caseData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>データが登録されていません</p>
                <p className="text-sm mt-2">
                  Excelファイルをアップロードするか、手動でデータを追加してください
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2">職種名</th>
                      <th className="text-left py-2 px-2">企画</th>
                      <th className="text-left py-2 px-2">勤務地</th>
                      <th className="text-left py-2 px-2">経験者</th>
                      <th className="text-right py-2 px-2">PV数</th>
                      <th className="text-right py-2 px-2">応募数</th>
                      <th className="text-center py-2 px-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={row.jobType}
                            onChange={(e) =>
                              handleCellChange(idx, 'jobType', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={row.plan}
                            onChange={(e) =>
                              handleCellChange(idx, 'plan', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-xs"
                          >
                            <option>MT-S</option>
                            <option>MT-A</option>
                            <option>MT-B</option>
                            <option>MT-C</option>
                            <option>MT-D</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={row.location}
                            onChange={(e) =>
                              handleCellChange(idx, 'location', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={row.experienceFlag}
                            onChange={(e) =>
                              handleCellChange(idx, 'experienceFlag', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-xs"
                          >
                            <option>経験者</option>
                            <option>未経験者</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={row.pvCount}
                            onChange={(e) =>
                              handleCellChange(idx, 'pvCount', parseInt(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-xs text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={row.applicationCount}
                            onChange={(e) =>
                              handleCellChange(idx, 'applicationCount', parseInt(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-xs text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            className="text-destructive hover:text-destructive/80 text-xs font-semibold"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
