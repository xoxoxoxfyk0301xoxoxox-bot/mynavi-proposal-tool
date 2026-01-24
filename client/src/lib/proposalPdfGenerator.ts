import { ProposalOutput, ProposalInput } from './proposalEngine';

/**
 * 提案結果をHTML形式に変換（PDF生成用）
 */
export function generateProposalHtml(input: ProposalInput, output: ProposalOutput): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const optionsHtml = output.options.length > 0
    ? output.options.map(opt => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${opt.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${opt.price}万円</td>
      </tr>
    `).join('')
    : '<tr><td colspan="2" style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">オプションなし</td></tr>';

  const caseExamplesHtml = output.appliedCampaigns && output.appliedCampaigns.length > 0
    ? `
      <h3 style="color: #0066CC; margin-top: 30px; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #0066CC; padding-bottom: 10px;">
        適用キャンペーン
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">キャンペーン名</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">割引内容</th>
          </tr>
        </thead>
        <tbody>
          ${output.appliedCampaigns.map(campaign => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${campaign.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">
                ${campaign.discountType === 'percentage' ? campaign.discountValue + '%' : campaign.discountValue + '万円'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    : '';

  const ticketPlansHtml = `
    <h3 style="color: #0066CC; margin-top: 30px; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #0066CC; padding-bottom: 10px;">
      長期掲載プラン（チケット）
    </h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">掲載期間</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">定価</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">割引後</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">割引額</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">2クール（8週間）</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.twoWeeks.price}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.twoWeeks.discountedPrice}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.twoWeeks.discount}万円</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">3クール（12週間）</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.threeWeeks.price}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.threeWeeks.discountedPrice}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.threeWeeks.discount}万円</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">6クール（24週間）</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.sixWeeks.price}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.sixWeeks.discountedPrice}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.sixWeeks.discount}万円</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">12クール（48週間）</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.twelveWeeks.price}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.twelveWeeks.discountedPrice}万円</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.ticketPlans.twelveWeeks.discount}万円</td>
        </tr>
      </tbody>
    </table>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>マイナビ転職 採用提案書</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #0066CC;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          color: #0066CC;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 14px;
          color: #666;
        }
        .company-info {
          background-color: #f5f5f5;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 5px;
        }
        .company-info h2 {
          font-size: 16px;
          color: #0066CC;
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .info-label {
          width: 150px;
          font-weight: bold;
          color: #333;
        }
        .info-value {
          flex: 1;
          color: #666;
        }
        .proposal-section {
          margin-bottom: 40px;
        }
        .proposal-section h3 {
          color: #0066CC;
          margin-bottom: 15px;
          font-size: 16px;
          border-bottom: 2px solid #0066CC;
          padding-bottom: 10px;
        }
        .difficulty-score {
          background-color: #f0f7ff;
          padding: 15px;
          border-left: 4px solid #0066CC;
          margin-bottom: 20px;
          border-radius: 3px;
        }
        .difficulty-score p {
          margin-bottom: 10px;
          font-size: 14px;
        }
        .score-bar {
          width: 100%;
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 5px;
        }
        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #0066CC);
          transition: width 0.3s ease;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: left;
          border-bottom: 2px solid #ddd;
          font-weight: bold;
          font-size: 14px;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          font-size: 14px;
        }
        .price-highlight {
          background-color: #fff3cd;
          padding: 15px;
          border-left: 4px solid #ffc107;
          margin-bottom: 20px;
          border-radius: 3px;
        }
        .price-highlight h4 {
          color: #856404;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .price-label {
          color: #666;
        }
        .price-value {
          font-weight: bold;
          color: #0066CC;
        }
        .total-price {
          font-size: 18px;
          color: #0066CC;
          font-weight: bold;
        }
        .selection-reason {
          background-color: #e8f5e9;
          padding: 15px;
          border-left: 4px solid #10B981;
          margin-bottom: 20px;
          border-radius: 3px;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        @media print {
          body {
            background-color: white;
          }
          .container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>マイナビ転職 採用提案書</h1>
          <p>作成日: ${dateStr}</p>
        </div>

        <div class="company-info">
          <h2>企業情報</h2>
          <div class="info-row">
            <span class="info-label">企業名</span>
            <span class="info-value">${input.companyName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">採用職種</span>
            <span class="info-value">${input.jobType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">勤務地</span>
            <span class="info-value">${input.location}</span>
          </div>
          <div class="info-row">
            <span class="info-label">採用人数</span>
            <span class="info-value">${input.hiringCount}名</span>
          </div>
          <div class="info-row">
            <span class="info-label">採用ターゲット</span>
            <span class="info-value">${input.targetAudience}</span>
          </div>
          <div class="info-row">
            <span class="info-label">希望採用時期</span>
            <span class="info-value">${input.desiredHiringPeriod}</span>
          </div>
        </div>

        <div class="proposal-section">
          <h3>提案内容</h3>
          
          <div class="difficulty-score">
            <p><strong>採用難易度スコア: ${output.difficultyScore.toFixed(1)}/5</strong></p>
            <div class="score-bar">
              <div class="score-fill" style="width: ${(output.difficultyScore / 5) * 100}%"></div>
            </div>
          </div>

          <table>
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">企画名</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">料金</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${output.plan.name}</strong><br><span style="font-size: 12px; color: #666;">${output.plan.description}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${output.plan.price}万円</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #0066CC; margin-top: 30px; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #0066CC; padding-bottom: 10px;">
            推奨オプション
          </h3>
          <table>
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">オプション名</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">料金</th>
              </tr>
            </thead>
            <tbody>
              ${optionsHtml}
            </tbody>
          </table>

          ${caseExamplesHtml}

          ${ticketPlansHtml}
        </div>

        <div class="proposal-section">
          <h3>提案理由</h3>
          <div class="selection-reason">${output.selectionReason}</div>
        </div>

        <div class="price-highlight">
          <h4>お見積もり（基本企画 + 推奨オプション）</h4>
          <div class="price-row">
            <span class="price-label">基本企画</span>
            <span class="price-value">${output.plan.price}万円</span>
          </div>
          ${output.options.map(opt => `
            <div class="price-row">
              <span class="price-label">${opt.name}</span>
              <span class="price-value">${opt.price}万円</span>
            </div>
          `).join('')}
          <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px;">
            <div class="price-row">
              <span class="price-label"><strong>小計（税抜）</strong></span>
              <span class="price-value">${output.totalPrice}万円</span>
            </div>
            <div class="price-row">
              <span class="price-label"><strong>合計（税込）</strong></span>
              <span class="total-price">${output.totalPriceWithTax}万円</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>本提案書は自動生成されています。詳細についてはマイナビ転職営業担当までお問い合わせください。</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * ブラウザでPDF出力を実行
 */
export function downloadProposalPdf(input: ProposalInput, output: ProposalOutput) {
  const html = generateProposalHtml(input, output);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  }
}
