# Haron Toma - Outlook Signature Installer
# Run this script once. Then select the signature in Outlook settings.

$sigFolder = "$env:APPDATA\Microsoft\Signatures"
$sigName   = "HaronToma_Sanixperts"
$srcFile   = "$PSScriptRoot\haron_sign_responsive.html"
$destFile  = "$sigFolder\$sigName.htm"

if (-not (Test-Path $sigFolder)) {
    New-Item -ItemType Directory -Path $sigFolder -Force | Out-Null
}

Copy-Item -Path $srcFile -Destination $destFile -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Signature installed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS in Outlook (Classic):" -ForegroundColor Yellow
Write-Host "  1. Open Outlook"
Write-Host "  2. File -> Options -> Mail -> Signatures"
Write-Host "  3. Click 'New' or select existing"
Write-Host "  4. In 'Choose default signature' dropdown"
Write-Host "     select: $sigName"
Write-Host "  5. Click OK"
Write-Host ""
Write-Host "If using NEW Outlook (Microsoft 365 app):" -ForegroundColor Yellow
Write-Host "  Settings (gear) -> Accounts -> Signatures"
Write-Host "  -> Create new -> paste from browser manually"
Write-Host ""
Write-Host "Signature file saved to:"
Write-Host "  $destFile" -ForegroundColor Gray
Write-Host ""
