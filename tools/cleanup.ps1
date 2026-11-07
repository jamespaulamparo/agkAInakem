# agkAInakem - remove files that are no longer used. Safe to run any time.
# Lists everything first and asks before deleting.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$legacy = @(
  'templates',                                   # old Django templates (site is now React)
  'static',                                      # old CSS/JS for those templates
  'frontend\src\components\Hero3D.jsx',
  'frontend\src\components\CitySeal.jsx',
  'frontend\src\pages\ReachOut.jsx',
  'frontend\src\pages\help\RequestForm.jsx'
) | Where-Object { Test-Path $_ }

# Built files: keep only the ones the current build lists in dist\sw.js
$stale = @()
$sw = 'frontend\dist\sw.js'
if (Test-Path $sw) {
  $keep = [regex]::Matches((Get-Content $sw -Raw), 'assets/[^"'']+') | ForEach-Object { $_.Value.Substring(7) }
  $stale = Get-ChildItem 'frontend\dist\assets' -File | Where-Object { $keep -notcontains $_.Name } | ForEach-Object { $_.FullName }
}

$all = @($legacy) + @($stale)
if ($all.Count -eq 0) { Write-Host 'Nothing to clean up.'; exit 0 }
Write-Host "These will be deleted:`n"
$all | ForEach-Object { Write-Host "  $_" }
$answer = Read-Host "`nDelete these $($all.Count) items? (y/n)"
if ($answer -ne 'y') { Write-Host 'Cancelled. Nothing was deleted.'; exit 0 }
$all | ForEach-Object { Remove-Item $_ -Recurse -Force }
Write-Host "Done. Removed $($all.Count) items."
