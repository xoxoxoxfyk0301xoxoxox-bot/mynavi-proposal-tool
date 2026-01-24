import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Trash2, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CaseData } from '@/lib/caseDataMatcher';
import {
  PricingData,
  TicketPricingData,
  OptionPricingData,
  CampaignData,
} from '@/lib/pricingData';

export default function AdminCaseData() {
  const [caseData, setCaseData] = useState<CaseData[]>([]);
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [ticketPricingData, setTicketPricingData] = useState<TicketPricingData[]>([]);
  const [optionPricingData, setOptionPricingData] = useState<OptionPricingData[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('case-data');

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

  // ローカルストレージに料金データを保存
  const savePricingToStorage = (data: PricingData[]) => {
    localStorage.setItem('adminPricingData', JSON.stringify(data));
    setPricingData(data);
  };

  // ローカルストレージにチケット料金データを保存
  const saveTicketPricingToStorage = (data: TicketPricingData[]) => {
    localStorage.setItem('adminTicketPricingData', JSON.stringify(data));
    setTicketPricingData(data);
  };

  // ローカルストレージにオプション料金データを保存
  const saveOptionPricingToStorage = (data: OptionPricingData[]) => {
    localStorage.setItem('adminOptionPricingData', JSON.stringify(data));
    setOptionPricingData(data);
  };

  // ローカルストレージにキャンペーンデータを保存
  const saveCampaignToStorage = (data: CampaignData[]) => {
    localStorage.setItem('adminCampaignData', JSON.stringify(data));
    setCampaignData(data);
  };

  // Excelファイルをアップロード（事例データ）
  const handleCaseDataUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

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

  // Excelファイルをアップロード（料金表）
  const handlePricingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const converted: PricingData[] = jsonData.map((row: any) => ({
        plan: row['企画'] || '',
        basePricePerWeek: parseInt(row['基本料金']) || 0,
        searchRank: row['検索順位'] || '',
        features: row['機能'] ? row['機能'].split('|').map((f: string) => f.trim()) : [],
      }));

      savePricingToStorage(converted);
      alert(`${converted.length}件の料金データをアップロードしました`);
      setIsLoading(false);
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  // Excelファイルをアップロード（チケット料金）
  const handleTicketPricingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const converted: TicketPricingData[] = jsonData.map((row: any) => ({
        plan: row['企画'] || '',
        twoWeeks: parseInt(row['2クール']) || 0,
        threeWeeks: parseInt(row['3クール']) || 0,
        sixWeeks: parseInt(row['6クール']) || 0,
        twelveWeeks: parseInt(row['12クール']) || 0,
      }));

      saveTicketPricingToStorage(converted);
      alert(`${converted.length}件のチケット料金データをアップロードしました`);
      setIsLoading(false);
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  // Excelファイルをアップロード（オプション料金）
  const handleOptionPricingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const converted: OptionPricingData[] = jsonData.map((row: any) => ({
        id: row['ID'] || '',
        name: row['名前'] || '',
        price: parseInt(row['料金']) || 0,
        description: row['説明'] || '',
        features: row['機能'] ? row['機能'].split('|').map((f: string) => f.trim()) : [],
        applicablePlans: row['適用企画'] ? row['適用企画'].split('|').map((p: string) => p.trim()) : [],
      }));

      saveOptionPricingToStorage(converted);
      alert(`${converted.length}件のオプション料金データをアップロードしました`);
      setIsLoading(false);
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  // Excelファイルをアップロード（キャンペーン）
  const handleCampaignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const converted: CampaignData[] = jsonData.map((row: any) => ({
        id: row['ID'] || '',
        name: row['名前'] || '',
        description: row['説明'] || '',
        discountType: row['割引タイプ']?.toLowerCase() === 'percentage' ? 'percentage' : 'fixed',
        discountValue: parseInt(row['割引値']) || 0,
        applicablePlans: row['適用企画'] ? row['適用企画'].split('|').map((p: string) => p.trim()) : [],
        startDate: row['開始日'] || '',
        endDate: row['終了日'] || '',
        isActive: row['有効'] === 'true' || row['有効'] === '1' || row['有効'] === true,
      }));

      saveCampaignToStorage(converted);
      alert(`${converted.length}件のキャンペーンデータをアップロードしました`);
      setIsLoading(false);
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  // データをダウンロード
  const handleDownload = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('ダウンロードするデータがありません');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
  };

  // データをクリア
  const handleClear = (setter: Function) => {
    if (window.confirm('すべてのデータを削除してもよろしいですか？')) {
      setter([]);
      alert('データを削除しました');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-foreground">
            管理画面 - データ管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            事例データ、料金表、キャンペーン情報をアップロードして、利用者への提示する情報を管理します
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="case-data">事例データ</TabsTrigger>
            <TabsTrigger value="pricing">料金表</TabsTrigger>
            <TabsTrigger value="ticket">チケット料金</TabsTrigger>
            <TabsTrigger value="options">オプション</TabsTrigger>
            <TabsTrigger value="campaigns">キャンペーン</TabsTrigger>
          </TabsList>

          {/* 事例データタブ */}
          <TabsContent value="case-data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>掲載実績データ</CardTitle>
                <CardDescription>
                  {caseData.length}件のデータが登録されています
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => document.getElementById('caseFileInput')?.click()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Excelをアップロード
                  </Button>

                  <Button
                    onClick={() => handleDownload(caseData, 'case_data.xlsx')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </Button>

                  <Button
                    onClick={() => handleClear(setCaseData)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    すべて削除
                  </Button>
                </div>

                <input
                  id="caseFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleCaseDataUpload}
                  className="hidden"
                />

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-semibold mb-2">必要な列：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>職種名、企画、職種コード、PV数、応募数</li>
                    <li>勤務地、経験者フラグ、年収コード、従業員数</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 料金表タブ */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>基本料金表</CardTitle>
                <CardDescription>
                  {pricingData.length}件のデータが登録されています
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => document.getElementById('pricingFileInput')?.click()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Excelをアップロード
                  </Button>

                  <Button
                    onClick={() => handleDownload(pricingData, 'pricing_data.xlsx')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </Button>

                  <Button
                    onClick={() => handleClear(setPricingData)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    すべて削除
                  </Button>
                </div>

                <input
                  id="pricingFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handlePricingUpload}
                  className="hidden"
                />

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-semibold mb-2">必要な列：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>企画（MT-S, MT-A, MT-B, MT-C, MT-D）</li>
                    <li>基本料金（万円）、検索順位、機能</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* チケット料金タブ */}
          <TabsContent value="ticket" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>チケット料金表</CardTitle>
                <CardDescription>
                  {ticketPricingData.length}件のデータが登録されています
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => document.getElementById('ticketFileInput')?.click()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Excelをアップロード
                  </Button>

                  <Button
                    onClick={() => handleDownload(ticketPricingData, 'ticket_pricing_data.xlsx')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </Button>

                  <Button
                    onClick={() => handleClear(setTicketPricingData)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    すべて削除
                  </Button>
                </div>

                <input
                  id="ticketFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleTicketPricingUpload}
                  className="hidden"
                />

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-semibold mb-2">必要な列：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>企画（MT-S, MT-A, MT-B, MT-C, MT-D）</li>
                    <li>2クール、3クール、6クール、12クール（万円）</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* オプションタブ */}
          <TabsContent value="options" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>オプション料金表</CardTitle>
                <CardDescription>
                  {optionPricingData.length}件のデータが登録されています
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => document.getElementById('optionFileInput')?.click()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Excelをアップロード
                  </Button>

                  <Button
                    onClick={() => handleDownload(optionPricingData, 'option_pricing_data.xlsx')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </Button>

                  <Button
                    onClick={() => handleClear(setOptionPricingData)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    すべて削除
                  </Button>
                </div>

                <input
                  id="optionFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleOptionPricingUpload}
                  className="hidden"
                />

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-semibold mb-2">必要な列：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>ID、名前、料金（万円）、説明</li>
                    <li>機能、適用企画（パイプ区切り）</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* キャンペーンタブ */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>キャンペーンデータ</CardTitle>
                <CardDescription>
                  {campaignData.length}件のデータが登録されています
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => document.getElementById('campaignFileInput')?.click()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Excelをアップロード
                  </Button>

                  <Button
                    onClick={() => handleDownload(campaignData, 'campaign_data.xlsx')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </Button>

                  <Button
                    onClick={() => handleClear(setCampaignData)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    すべて削除
                  </Button>
                </div>

                <input
                  id="campaignFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleCampaignUpload}
                  className="hidden"
                />

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-semibold mb-2">必要な列：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>ID、名前、説明、割引タイプ（percentage/fixed）</li>
                    <li>割引値、適用企画（パイプ区切り）</li>
                    <li>開始日、終了日（YYYY-MM-DD）、有効（true/false）</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
