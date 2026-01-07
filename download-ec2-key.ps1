# Download EC2 Key Pair
# Note: AWS doesn't allow downloading existing key pairs via CLI
# You must download it from the console or create a new one

Write-Host "📥 EC2 Key Pair Download Instructions" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  AWS doesn't allow downloading existing key pairs via CLI for security reasons." -ForegroundColor Red
Write-Host ""

Write-Host "Option 1: Download from Console (Recommended)" -ForegroundColor Cyan
Write-Host "1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:" -ForegroundColor White
Write-Host "2. Find 'Ec2 Tutorial' key pair"
Write-Host "3. If you see a 'Download' button, click it"
Write-Host "4. Save the .pem file to: $env:USERPROFILE\.ssh\Ec2-Tutorial.pem" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Create New Key Pair" -ForegroundColor Cyan
Write-Host "If you don't have the key, create a new one:" -ForegroundColor White
Write-Host ""
Write-Host "aws ec2 create-key-pair --key-name wissen-key --query 'KeyMaterial' --output text > $env:USERPROFILE\.ssh\wissen-key.pem" -ForegroundColor Gray
Write-Host ""
Write-Host "Then update the instance to use the new key, or launch a new instance with this key." -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 3: Check if key exists in other locations" -ForegroundColor Cyan
$SearchPaths = @(
    "$env:USERPROFILE\.ssh",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop",
    "."
)

Write-Host "Searching for .pem files..." -ForegroundColor Yellow
foreach ($path in $SearchPaths) {
    if (Test-Path $path) {
        $keys = Get-ChildItem -Path $path -Filter "*.pem" -ErrorAction SilentlyContinue
        if ($keys) {
            Write-Host "Found keys in $path :" -ForegroundColor Green
            $keys | ForEach-Object { Write-Host "  - $($_.FullName)" }
        }
    }
}

