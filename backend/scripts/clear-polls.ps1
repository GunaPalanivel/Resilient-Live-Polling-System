# Clear all active polls from the database (development only)
# This helps when a poll is stuck and blocking new polls from being created

Write-Host "🧹 Clearing active polls..." -ForegroundColor Green

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/polls/admin/clear-active" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{}' `
  -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
  Write-Host "✅ Active polls cleared successfully!" -ForegroundColor Green
  Write-Host $response.Content
} else {
  Write-Host "❌ Failed to clear polls" -ForegroundColor Red
  Write-Host $response
}
