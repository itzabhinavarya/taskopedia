# PowerShell script to update pnpm-lock.yaml
# Run this before building Docker images if lockfile is outdated

Write-Host "Updating pnpm-lock.yaml..." -ForegroundColor Cyan
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Lockfile updated successfully!" -ForegroundColor Green
    Write-Host "You can now run: docker-compose build" -ForegroundColor Yellow
} else {
    Write-Host "Failed to update lockfile. Please check the error above." -ForegroundColor Red
    exit 1
}

