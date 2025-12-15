import type { BatchResult } from '../../../domain/queue/batch-job.interface';

export function generateBatchCompleteEmail(data: BatchResult): {
  subject: string;
  html: string;
  text: string;
} {
  const successRate = ((data.success / data.total) * 100).toFixed(2);
  const failureRate = ((data.failed / data.total) * 100).toFixed(2);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 15px; background-color: white; border-radius: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .success { color: #4CAF50; }
        .failed { color: #f44336; }
        .errors { margin-top: 20px; }
        .error-item { padding: 10px; margin: 5px 0; background-color: #ffebee; border-left: 4px solid #f44336; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Processamento de Lote Concluído</h1>
        </div>
        <div class="content">
          <p>O processamento do lote <strong>${data.batchId}</strong> foi concluído.</p>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${data.total}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-box">
              <div class="stat-value success">${data.success}</div>
              <div class="stat-label">Sucesso (${successRate}%)</div>
            </div>
            <div class="stat-box">
              <div class="stat-value failed">${data.failed}</div>
              <div class="stat-label">Falhas (${failureRate}%)</div>
            </div>
          </div>

          ${
            data.errors.length > 0
              ? `
            <div class="errors">
              <h3>Erros Encontrados:</h3>
              ${data.errors
                .map(
                  (error) => `
                <div class="error-item">
                  <strong>Payable ID:</strong> ${error.payableId}<br>
                  <strong>Erro:</strong> ${error.error}
                </div>
              `,
                )
                .join('')}
            </div>
          `
              : ''
          }

          <p><strong>Processado em:</strong> ${data.processedAt.toLocaleString('pt-BR')}</p>
        </div>
        <div class="footer">
          <p>Aprove-me - Sistema de Gerenciamento de Recebíveis</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Processamento de Lote Concluído

Lote ID: ${data.batchId}
Processado em: ${data.processedAt.toLocaleString('pt-BR')}

Estatísticas:
- Total: ${data.total}
- Sucesso: ${data.success} (${successRate}%)
- Falhas: ${data.failed} (${failureRate}%)

${
  data.errors.length > 0
    ? `\nErros Encontrados:\n${data.errors.map((e) => `- Payable ${e.payableId}: ${e.error}`).join('\n')}`
    : ''
}
  `;

  return {
    subject: `Processamento de Lote ${data.batchId} - ${data.success}/${data.total} Sucessos`,
    html,
    text,
  };
}

export function generateDeadLetterEmail(data: {
  payableId: string;
  batchId: string;
  error: string;
  attempts: number;
}): { subject: string; html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #ffebee; }
        .alert { padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0; }
        .error-box { padding: 15px; background-color: white; border-left: 4px solid #f44336; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Item Enviado para Fila Morta</h1>
        </div>
        <div class="content">
          <div class="alert">
            <strong>Atenção!</strong> Um item foi enviado para a Fila Morta após ${data.attempts} tentativas falhadas.
          </div>
          
          <div class="error-box">
            <h3>Detalhes do Item:</h3>
            <p><strong>Payable ID:</strong> ${data.payableId}</p>
            <p><strong>Batch ID:</strong> ${data.batchId}</p>
            <p><strong>Tentativas:</strong> ${data.attempts}</p>
            <p><strong>Erro:</strong> ${data.error}</p>
          </div>

          <p>Por favor, revise este item manualmente e tome as ações necessárias.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
⚠️ ITEM ENVIADO PARA FILA MORTA

Atenção! Um item foi enviado para a Fila Morta após ${data.attempts} tentativas falhadas.

Detalhes:
- Payable ID: ${data.payableId}
- Batch ID: ${data.batchId}
- Tentativas: ${data.attempts}
- Erro: ${data.error}

Por favor, revise este item manualmente.
  `;

  return {
    subject: `[FILA MORTA] Payable ${data.payableId} - Requer Atenção`,
    html,
    text,
  };
}
