import { spawn } from 'child_process';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES DE INTEGRAÇÃO DO SERVIDOR E LIMITADOR DE REQUISIÇÕES ===");

// 1. Iniciar o servidor como processo filho
const spawnCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const serverProcess = spawn(spawnCmd, ['tsx', 'server.ts'], {
  cwd: path.resolve(process.cwd()),
  env: { ...process.env, PORT: '3001', NODE_ENV: 'test' },
  shell: true
});

let serverOutput = '';
serverProcess.stdout?.on('data', (data) => {
  serverOutput += data.toString();
  // console.log(`[Server stdout]: ${data}`);
});

serverProcess.stderr?.on('data', (data) => {
  console.error(`[Server stderr]: ${data}`);
});

// Aguardar o servidor iniciar
const waitForServer = () => {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (serverOutput.includes('Server running on')) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > 30000) {
        clearInterval(interval);
        reject(new Error('Servidor demorou muito para iniciar ou falhou.'));
      }
    }, 200);
  });
};

async function runTests() {
  try {
    await waitForServer();
    console.log("✅ Servidor iniciado na porta 3001.");

    // Teste 1: Buscar lista de guildas inicial
    console.log("Teste 1: GET /api/guilds...");
    const res = await fetch('http://localhost:3001/api/guilds');
    assert(res.ok, `Status deveria ser ok, obtido: ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), "Resposta deveria ser um array de guildas");
    console.log(`✅ Teste 1 passou. Encontradas ${data.length} guildas.`);

    // Teste 2: Testar se o limitador de requisições foi relaxado (120 requisições seguidas)
    console.log("Teste 2: Teste de carga com 120 requisições consecutivas para validar que o rate limiter (429) não bloqueia em ambiente de teste...");
    let successCount = 0;
    let rateLimitedCount = 0;

    for (let i = 0; i < 120; i++) {
      const response = await fetch('http://localhost:3001/api/guilds');
      if (response.status === 200) {
        successCount++;
      } else if (response.status === 429) {
        rateLimitedCount++;
      }
    }

    console.log(`Resultados do teste de carga: 200 OK: ${successCount}, 429 Too Many Requests: ${rateLimitedCount}`);
    assert(rateLimitedCount === 0, "Nenhuma requisição deveria ter sido bloqueada pelo rate limiter.");
    assert(successCount === 120, "Todas as 120 requisições deveriam ter retornado status 200 OK.");
    console.log("✅ Teste 2 passou. O rate limiter foi relaxado com sucesso.");

    console.log("=== TODOS OS TESTES DE INTEGRAÇÃO PASSARAM COM SUCESSO! ===");
    cleanup(0);
  } catch (error) {
    console.error("❌ Testes falharam:", error);
    cleanup(1);
  }
}

function cleanup(code: number) {
  console.log("Finalizando processo do servidor...");
  serverProcess.kill('SIGTERM');
  process.exit(code);
}

runTests();
