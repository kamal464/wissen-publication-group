# 🚀 Automatic AWS Setup Script for Windows
# This script checks and installs everything needed

Write-Host "🚀 Automatic AWS Setup Starting..." -ForegroundColor Green
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Step 1: Check and Install AWS CLI
Write-Host "=== STEP 1: Checking AWS CLI ===" -ForegroundColor Cyan
if (Test-Command "aws") {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI is installed: $awsVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  AWS CLI not found. Installing..." -ForegroundColor Yellow
    
    # Download AWS CLI
    $msiPath = "$env:TEMP\AWSCLIV2.msi"
    Write-Host "Downloading AWS CLI..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile $msiPath -UseBasicParsing
        Write-Host "Installing AWS CLI (this may take a few minutes)..." -ForegroundColor Yellow
        Start-Process msiexec.exe -ArgumentList "/i $msiPath /quiet /norestart" -Wait
        Remove-Item $msiPath -ErrorAction SilentlyContinue
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        Start-Sleep -Seconds 2
        if (Test-Command "aws") {
            Write-Host "✅ AWS CLI installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Installation may have failed. Please restart PowerShell and try again." -ForegroundColor Red
            Write-Host "   Or download manually from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to download/install AWS CLI: $_" -ForegroundColor Red
        Write-Host "   Please download manually from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 2: Check AWS Configuration
Write-Host "=== STEP 2: Checking AWS Configuration ===" -ForegroundColor Cyan
if (Test-Command "aws") {
    $credentialsPath = "$env:USERPROFILE\.aws\credentials"
    $configPath = "$env:USERPROFILE\.aws\config"
    
    if ((Test-Path $credentialsPath) -or (Test-Path $configPath)) {
        Write-Host "✅ AWS configuration files found" -ForegroundColor Green
        
        # Test credentials
        try {
            $identity = aws sts get-caller-identity 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ AWS credentials are valid" -ForegroundColor Green
                Write-Host ""
                Write-Host "Current AWS Identity:" -ForegroundColor Cyan
                aws sts get-caller-identity --output table
            } else {
                Write-Host "❌ AWS credentials are invalid" -ForegroundColor Red
                Write-Host "   Run: aws configure" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Error checking credentials: $_" -ForegroundColor Red
            Write-Host "   Run: aws configure" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  AWS not configured" -ForegroundColor Yellow
        Write-Host "   You need to configure AWS credentials:" -ForegroundColor Yellow
        Write-Host "   1. Get your AWS Access Key from: https://console.aws.amazon.com/iam/" -ForegroundColor Yellow
        Write-Host "   2. Run: aws configure" -ForegroundColor Yellow
        Write-Host ""
        $configure = Read-Host "Would you like to configure now? (y/n)"
        if ($configure -eq "y" -or $configure -eq "Y") {
            aws configure
        }
    }
} else {
    Write-Host "⚠️  AWS CLI not available. Configure after installation." -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Check Default Region
Write-Host "=== STEP 3: Checking Default Region ===" -ForegroundColor Cyan
if (Test-Command "aws") {
    try {
        $region = aws configure get region 2>&1
        if ($region -and $region -ne "None") {
            Write-Host "✅ Default region: $region" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Default region not set. Setting to us-east-1..." -ForegroundColor Yellow
            aws configure set region us-east-1
            Write-Host "✅ Default region set to us-east-1" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not check/set region" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Check and Install jq
Write-Host "=== STEP 4: Checking jq ===" -ForegroundColor Cyan
if (Test-Command "jq") {
    $jqVersion = jq --version
    Write-Host "✅ jq is installed: $jqVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  jq not found. Installing..." -ForegroundColor Yellow
    
    # Try Chocolatey first
    if (Test-Command "choco") {
        Write-Host "Installing jq via Chocolatey..." -ForegroundColor Yellow
        choco install jq -y
        if (Test-Command "jq") {
            Write-Host "✅ jq installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Chocolatey installation may have failed. Trying manual download..." -ForegroundColor Yellow
        }
    }
    
    # Manual download if Chocolatey failed or not available
    if (-not (Test-Command "jq")) {
        Write-Host "Downloading jq manually..." -ForegroundColor Yellow
        try {
            $jqUrl = "https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-win64.exe"
            $jqDir = "$env:USERPROFILE\.local\bin"
            $jqPath = "$jqDir\jq.exe"
            
            if (-not (Test-Path $jqDir)) {
                New-Item -ItemType Directory -Path $jqDir -Force | Out-Null
            }
            
            Invoke-WebRequest -Uri $jqUrl -OutFile $jqPath -UseBasicParsing
            $env:Path += ";$jqDir"
            [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)
            
            if (Test-Path $jqPath) {
                Write-Host "✅ jq installed successfully!" -ForegroundColor Green
                Write-Host "   Location: $jqPath" -ForegroundColor Gray
            }
        } catch {
            Write-Host "❌ Failed to install jq: $_" -ForegroundColor Red
            Write-Host "   Please install manually:" -ForegroundColor Yellow
            Write-Host "   - Via Chocolatey: choco install jq" -ForegroundColor Yellow
            Write-Host "   - Or download from: https://stedolan.github.io/jq/download/" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Step 5: Check Key Pairs
Write-Host "=== STEP 5: Checking EC2 Key Pairs ===" -ForegroundColor Cyan
if (Test-Command "aws") {
    try {
        $region = aws configure get region
        if (-not $region -or $region -eq "None") {
            $region = "us-east-1"
        }
        
        Write-Host "Checking key pairs in region: $region" -ForegroundColor Gray
        $keyPairs = aws ec2 describe-key-pairs --region $region --query 'KeyPairs[*].KeyName' --output text 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $keyPairs) {
            Write-Host "✅ Found key pairs:" -ForegroundColor Green
            $keyPairsArray = $keyPairs -split "`t"
            foreach ($key in $keyPairsArray) {
                if ($key) {
                    Write-Host "   - $key" -ForegroundColor Cyan
                    
                    # Check if key file exists locally
                    $keyFile = "$env:USERPROFILE\.ssh\$key.pem"
                    if (Test-Path $keyFile) {
                        Write-Host "     ✅ Key file found: $keyFile" -ForegroundColor Green
                    } else {
                        Write-Host "     ⚠️  Key file NOT found locally: $keyFile" -ForegroundColor Yellow
                        Write-Host "     You may need to download it from AWS Console" -ForegroundColor Gray
                    }
                }
            }
        } else {
            Write-Host "⚠️  No key pairs found in region $region" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "To create a new key pair, run:" -ForegroundColor Yellow
            Write-Host "  aws ec2 create-key-pair --key-name wissen-secure-key --region $region --query 'KeyMaterial' --output text | Out-File -FilePath `"$env:USERPROFILE\.ssh\wissen-secure-key.pem`"" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Could not check key pairs: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  AWS CLI not available" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Check Script Files
Write-Host "=== STEP 6: Checking Script Files ===" -ForegroundColor Cyan
$scriptDir = $PSScriptRoot
$launchScript = Join-Path $scriptDir "launch-new-instance.sh"
$checkScript = Join-Path $scriptDir "check-aws-setup.sh"

if (Test-Path $launchScript) {
    Write-Host "✅ Launch script found: $launchScript" -ForegroundColor Green
} else {
    Write-Host "❌ Launch script not found: $launchScript" -ForegroundColor Red
}

if (Test-Path $checkScript) {
    Write-Host "✅ Check script found: $checkScript" -ForegroundColor Green
} else {
    Write-Host "⚠️  Check script not found: $checkScript" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

if (-not (Test-Command "aws")) {
    Write-Host "❌ AWS CLI not installed" -ForegroundColor Red
    $allGood = $false
} else {
    Write-Host "✅ AWS CLI installed" -ForegroundColor Green
}

if (Test-Command "aws") {
    try {
        $null = aws sts get-caller-identity 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ AWS credentials valid" -ForegroundColor Green
        } else {
            Write-Host "❌ AWS credentials invalid or not configured" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ AWS credentials invalid" -ForegroundColor Red
        $allGood = $false
    }
}

if (-not (Test-Command "jq")) {
    Write-Host "❌ jq not installed" -ForegroundColor Red
    $allGood = $false
} else {
    Write-Host "✅ jq installed" -ForegroundColor Green
}

Write-Host ""

if ($allGood) {
    Write-Host "✅ All prerequisites are ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Edit launch-new-instance.sh and set KEY_NAME (line 9)" -ForegroundColor Yellow
    Write-Host "2. Use Git Bash or WSL to run: ./launch-new-instance.sh" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use Git Bash/WSL to run the verification script:" -ForegroundColor Cyan
    Write-Host "  chmod +x check-aws-setup.sh" -ForegroundColor Gray
    Write-Host "  ./check-aws-setup.sh" -ForegroundColor Gray
} else {
    Write-Host "❌ Some prerequisites are missing. Please fix the issues above." -ForegroundColor Red
}

Write-Host ""
