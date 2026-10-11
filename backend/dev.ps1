$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " SICSI III - BACKEND FASTAPI" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Host "[ERRO] Ambiente virtual não encontrado:" -ForegroundColor Red
    Write-Host $python -ForegroundColor Red
    exit 1
}

$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "[OK] Ambiente virtual encontrado." -ForegroundColor Green
Write-Host "[OK] UTF-8 do Python activado." -ForegroundColor Green
Write-Host "[OK] A iniciar FastAPI..." -ForegroundColor Green
Write-Host "[INFO] http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""

& $python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000