$dirs = @(
    'c:\xampp\htdocs\raselcloud\app\services\[slug]',
    'c:\xampp\htdocs\raselcloud\app\blog\[slug]',
    'c:\xampp\htdocs\raselcloud\app\api\blog\[slug]',
    'c:\xampp\htdocs\raselcloud\app\api\admin\team',
    'c:\xampp\htdocs\raselcloud\src\pages',
    'c:\xampp\htdocs\raselcloud\src\components',
    'c:\xampp\htdocs\raselcloud\src\contexts'
)
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Filter '*.tsx' | ForEach-Object {
            $lines = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
            $newContent = $lines -replace 'rasel\.cloud', 'codecraftbd.info' -replace 'rasel-cloud', 'codecraftbd' -replace 'raselcloud', 'codecraftbd' -replace 'Rasel Cloud', 'Code Craft BD'
            if ($newContent -ne $lines) {
                [System.IO.File]::WriteAllText($_.FullName, $newContent, [System.Text.Encoding]::UTF8)
                Write-Host "Fixed: $($_.FullName)"
            }
        }
        Get-ChildItem -Path $dir -Filter '*.ts' | ForEach-Object {
            $lines = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
            $newContent = $lines -replace 'rasel\.cloud', 'codecraftbd.info' -replace 'rasel-cloud', 'codecraftbd' -replace 'raselcloud', 'codecraftbd' -replace 'Rasel Cloud', 'Code Craft BD'
            if ($newContent -ne $lines) {
                [System.IO.File]::WriteAllText($_.FullName, $newContent, [System.Text.Encoding]::UTF8)
                Write-Host "Fixed: $($_.FullName)"
            }
        }
    }
}
Write-Host "Done!"
