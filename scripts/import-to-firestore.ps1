# =============================================================
# import-to-firestore.ps1
# Sends the db-export.json to the local /api/import endpoint
# which writes all data into Firebase Firestore.
# =============================================================
# USAGE: powershell -ExecutionPolicy Bypass -File scripts\import-to-firestore.ps1
# =============================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath  = Join-Path $scriptDir "db-export.json"
$url       = "http://localhost:3000/api/import?key=rasel-cloud-seed-2026"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " rasel.cloud — Database Import Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $jsonPath)) {
    Write-Host "ERROR: db-export.json not found at $jsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading export file: $jsonPath" -ForegroundColor Yellow
$json = Get-Content $jsonPath -Raw -Encoding UTF8

Write-Host "Sending to: $url" -ForegroundColor Yellow
Write-Host "Please wait..." -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest `
        -Uri $url `
        -Method POST `
        -Body $json `
        -ContentType "application/json; charset=utf-8" `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json

    Write-Host "=========================================" -ForegroundColor Green
    Write-Host " IMPORT COMPLETE" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""

    if ($result.results) {
        Write-Host "Results ($($result.results.Count) operations):" -ForegroundColor Cyan
        foreach ($line in $result.results) {
            if ($line -like "created*") {
                Write-Host "  ✅ $line" -ForegroundColor Green
            } elseif ($line -like "skip*") {
                Write-Host "  ⏭️  $line" -ForegroundColor Yellow
            } else {
                Write-Host "  ℹ️  $line" -ForegroundColor Gray
            }
        }
    }

    if ($result.errors -and $result.errors.Count -gt 0) {
        Write-Host ""
        Write-Host "Errors ($($result.errors.Count)):" -ForegroundColor Red
        foreach ($err in $result.errors) {
            Write-Host "  ❌ $err" -ForegroundColor Red
        }
    }

    Write-Host ""
    if ($result.success) {
        Write-Host "✅ All data imported successfully into Firebase Firestore!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Import completed with some errors. Check above." -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "NOTE: Imported users have default password: 123456" -ForegroundColor Magenta
    Write-Host "      Admin user: admin@rasel.cloud  password: 123456" -ForegroundColor Magenta
    Write-Host ""

} catch {
    Write-Host "ERROR: Failed to reach the import endpoint." -ForegroundColor Red
    Write-Host "Make sure the Next.js dev server is running on port 3000." -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
