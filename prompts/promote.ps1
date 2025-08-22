param([switch]$DryRun)

$src = "./site"
$dst = "./root/site"

if ($DryRun) {
  Write-Host "Dry run: copying $src to $dst"
} else {
  Copy-Item -Path $src/* -Destination $dst -Recurse -Force
  Write-Host "Promoted site files to root"
}
