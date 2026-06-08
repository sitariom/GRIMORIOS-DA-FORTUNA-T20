param (
    [string]$TargetDir = "docs\memory\external-refs"
)

Write-Host "🔄 Iniciando sincronização e atualização de conhecimentos da Agência..." -ForegroundColor Cyan

$repos = @(
    "multica-ai/andrej-karpathy-skills",
    "kepano/obsidian-skills",
    "breferrari/obsidian-mind",
    "msitarzewski/agency-agents"
)

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

foreach ($repo in $repos) {
    $urlMain = "https://raw.githubusercontent.com/$repo/main/README.md"
    $urlMaster = "https://raw.githubusercontent.com/$repo/master/README.md"
    $outFile = "$TargetDir\$($repo -replace '/', '-').md"
    
    Write-Host "Baixando referências de $repo..." -NoNewline
    try {
        Invoke-RestMethod -Uri $urlMain -OutFile $outFile -ErrorAction Stop
        Write-Host " [OK - main]" -ForegroundColor Green
    } catch {
        try {
            Invoke-RestMethod -Uri $urlMaster -OutFile $outFile -ErrorAction Stop
            Write-Host " [OK - master]" -ForegroundColor Green
        } catch {
            Write-Host " [FALHA]" -ForegroundColor Red
        }
    }
}

Write-Host "`n✅ Conhecimento externo atualizado em $TargetDir." -ForegroundColor Green
Write-Host "👉 Próximo Passo: Peça ao Orquestrador (Trae) para analisar os novos arquivos e evoluir as skills/CLAUDE.md localmente." -ForegroundColor Yellow
