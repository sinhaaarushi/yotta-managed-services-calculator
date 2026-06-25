# Run from project root AFTER: gh auth login
# Creates public repo and pushes main branch.

$ErrorActionPreference = "Stop"
$repoName = "managed-services-calculator"

gh auth status | Out-Null

$existing = gh repo view $repoName 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Repo $repoName already exists. Pushing to origin..."
  git remote remove origin 2>$null
  git remote add origin "https://github.com/$(gh api user -q .login)/$repoName.git"
  git push -u origin main
} else {
  gh repo create $repoName --public --source=. --remote=origin --push
}

Write-Host ""
Write-Host "Done. Next: GitHub repo -> Settings -> Pages -> Source: GitHub Actions"
Write-Host "Then open Actions tab and wait for Deploy to GitHub Pages to finish."
