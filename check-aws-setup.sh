#!/bin/bash
# 🔍 AWS Setup Verification Script
# Checks AWS CLI, configuration, and key pairs

echo "🔍 AWS Setup Verification"
echo "========================"
echo ""

# Check 1: AWS CLI Installation
echo "=== CHECK 1: AWS CLI Installation ==="
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1)
    echo "✅ AWS CLI is installed"
    echo "   Version: $AWS_VERSION"
else
    echo "❌ AWS CLI is NOT installed"
    echo "   Install from: https://aws.amazon.com/cli/"
    exit 1
fi
echo ""

# Check 2: AWS Configuration
echo "=== CHECK 2: AWS Configuration ==="
if [ -f ~/.aws/credentials ] || [ -f ~/.aws/config ]; then
    echo "✅ AWS configuration files found"
    
    # Check if credentials are set
    if aws sts get-caller-identity &> /dev/null; then
        echo "✅ AWS credentials are valid"
        echo ""
        echo "Current AWS Identity:"
        aws sts get-caller-identity --output table
    else
        echo "❌ AWS credentials are invalid or not configured"
        echo "   Run: aws configure"
        exit 1
    fi
else
    echo "❌ AWS configuration not found"
    echo "   Run: aws configure"
    exit 1
fi
echo ""

# Check 3: Default Region
echo "=== CHECK 3: Default Region ==="
DEFAULT_REGION=$(aws configure get region 2>/dev/null || echo "not set")
if [ "$DEFAULT_REGION" != "not set" ] && [ -n "$DEFAULT_REGION" ]; then
    echo "✅ Default region: $DEFAULT_REGION"
else
    echo "⚠️  Default region not set"
    echo "   Setting to us-east-1..."
    aws configure set region us-east-1
    echo "✅ Default region set to us-east-1"
fi
echo ""

# Check 4: jq Installation
echo "=== CHECK 4: jq Installation ==="
if command -v jq &> /dev/null; then
    JQ_VERSION=$(jq --version 2>&1)
    echo "✅ jq is installed"
    echo "   Version: $JQ_VERSION"
else
    echo "❌ jq is NOT installed"
    echo "   Install: sudo apt install jq (Linux) or brew install jq (Mac)"
    exit 1
fi
echo ""

# Check 5: Key Pairs
echo "=== CHECK 5: EC2 Key Pairs ==="
REGION=$(aws configure get region)
echo "Checking key pairs in region: $REGION"
echo ""

KEY_PAIRS=$(aws ec2 describe-key-pairs --region $REGION --query 'KeyPairs[*].KeyName' --output text 2>/dev/null)

if [ -z "$KEY_PAIRS" ]; then
    echo "⚠️  No key pairs found in region $REGION"
    echo ""
    echo "To create a new key pair:"
    echo "  aws ec2 create-key-pair --key-name wissen-secure-key --query 'KeyMaterial' --output text > ~/.ssh/wissen-secure-key.pem"
    echo "  chmod 400 ~/.ssh/wissen-secure-key.pem"
else
    echo "✅ Found key pairs:"
    for key in $KEY_PAIRS; do
        echo "   - $key"
        
        # Check if key file exists locally
        KEY_FILE="$HOME/.ssh/$key.pem"
        if [ -f "$KEY_FILE" ]; then
            echo "     ✅ Key file found: $KEY_FILE"
            
            # Check permissions
            PERMS=$(stat -c "%a" "$KEY_FILE" 2>/dev/null || stat -f "%OLp" "$KEY_FILE" 2>/dev/null || echo "unknown")
            if [ "$PERMS" == "400" ] || [ "$PERMS" == "600" ]; then
                echo "     ✅ Key file permissions: $PERMS (correct)"
            else
                echo "     ⚠️  Key file permissions: $PERMS (should be 400)"
                echo "     Fix with: chmod 400 $KEY_FILE"
            fi
        else
            echo "     ⚠️  Key file NOT found locally: $KEY_FILE"
            echo "     Download from AWS Console or recreate key pair"
        fi
    done
fi
echo ""

# Check 6: Script Files
echo "=== CHECK 6: Script Files ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCH_SCRIPT="$SCRIPT_DIR/launch-new-instance.sh"

if [ -f "$LAUNCH_SCRIPT" ]; then
    echo "✅ Launch script found: $LAUNCH_SCRIPT"
    if [ -x "$LAUNCH_SCRIPT" ]; then
        echo "✅ Script is executable"
    else
        echo "⚠️  Script is not executable"
        echo "   Fix with: chmod +x $LAUNCH_SCRIPT"
    fi
else
    echo "❌ Launch script not found: $LAUNCH_SCRIPT"
fi
echo ""

# Summary
echo "========================"
echo "📋 VERIFICATION SUMMARY"
echo "========================"
echo ""

ALL_GOOD=true

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed"
    ALL_GOOD=false
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials invalid"
    ALL_GOOD=false
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq not installed"
    ALL_GOOD=false
fi

if [ -z "$KEY_PAIRS" ]; then
    echo "⚠️  No key pairs found (you may need to create one)"
fi

if [ "$ALL_GOOD" = true ]; then
    echo "✅ All checks passed! Ready to launch instance."
    echo ""
    echo "Next steps:"
    echo "1. Edit launch-new-instance.sh and set KEY_NAME"
    echo "2. Run: ./launch-new-instance.sh"
else
    echo "❌ Some checks failed. Please fix the issues above."
    exit 1
fi
