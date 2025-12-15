$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Set-Location $Root
$Output = "family-memory-capsule.zip"
if (Test-Path $Output) { Remove-Item $Output }

$exclude = @("node_modules",".next","out","coverage","*.zip",".DS_Store")

$items = Get-ChildItem -Force | Where-Object { $_.Name -notin @("node_modules", ".git") }
Compress-Archive -Path $items -DestinationPath $Output -Force -CompressionLevel Optimal -Exclude $exclude

Write-Host "Created $Output"
