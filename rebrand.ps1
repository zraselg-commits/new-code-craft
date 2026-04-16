$replacements = @(
    @{ Old = 'rasel.cloud'; New = 'codecraftbd.info' },
    @{ Old = 'rasel-cloud'; New = 'codecraftbd' },
    @{ Old = 'raselcloud'; New = 'codecraftbd' },
    @{ Old = 'Rasel Cloud'; New = 'Code Craft BD' },
    @{ Old = 'hello@codecraftbd.info'; New = 'hello@codecraftbd.info' }
)

$dirs = @('app', 'src\components', 'src\pages')
foreach ($dir in $dirs) {
    $fullPath = Join-Path 'c:\xampp\htdocs\raselcloud' $dir
    if (Test-Path $fullPath) {
        Get-ChildItem -Path $fullPath -Recurse -Include '*.tsx','*.ts' | ForEach-Object {
            $content = Get-Content $_.FullName -Raw -Encoding UTF8
            $changed = $false
            foreach ($r in $replacements) {
                if ($content -match [regex]::Escape($r.Old)) {
                    $content = $content -replace [regex]::Escape($r.Old), $r.New
                    $changed = $true
                }
            }
            if ($changed) {
                [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.Encoding]::UTF8)
                Write-Host "Updated: $($_.Name)"
            }
        }
    }
}
Write-Host "Done!"
