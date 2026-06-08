param (
    [string]$TargetDir = "."
)

$BlueprintDir = "$PSScriptRoot\ai-agency-blueprint"

if (-not (Test-Path $BlueprintDir)) {
    Write-Host "Blueprint não encontrado. Execute de dentro do diretório que contém a pasta ai-agency-blueprint." -ForegroundColor Red
    exit
}

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

Write-Host "🚀 Iniciando inicialização da AI Agency no projeto: $TargetDir" -ForegroundColor Cyan

# Copia os arquivos globais
Copy-Item -Path "$BlueprintDir\CLAUDE.md" -Destination "$TargetDir\CLAUDE.md" -Force
Copy-Item -Path "$BlueprintDir\.trae" -Destination "$TargetDir" -Recurse -Force
Copy-Item -Path "$BlueprintDir\docs" -Destination "$TargetDir" -Recurse -Force
Copy-Item -Path "$BlueprintDir\.github" -Destination "$TargetDir" -Recurse -Force
Copy-Item -Path "$BlueprintDir\tasks" -Destination "$TargetDir" -Recurse -Force

Write-Host "✅ Estrutura de Agência copiada com sucesso!" -ForegroundColor Green
Write-Host "As skills (PO, QA, Coder, Mind) e a memória Obsidian já estão ativas para a IA no seu novo projeto." -ForegroundColor Yellow
