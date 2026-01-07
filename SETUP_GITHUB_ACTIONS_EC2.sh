#!/bin/bash
# Setup script for GitHub Actions EC2 deployment
# Run this on your local machine or EC2

echo "🔧 Setting up GitHub Actions for EC2 deployment..."
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/github_actions_ec2 ]; then
    echo "📝 Generating new SSH key pair..."
    ssh-keygen -t rsa -b 4096 -C "github-actions-ec2" -f ~/.ssh/github_actions_ec2 -N ""
    echo "✅ SSH key pair generated"
else
    echo "✅ SSH key already exists"
fi

echo ""
echo "=========================================="
echo "📋 Next Steps:"
echo "=========================================="
echo ""
echo "1. Add Public Key to EC2:"
echo "   Run this on EC2:"
echo "   echo '$(cat ~/.ssh/github_actions_ec2.pub)' >> ~/.ssh/authorized_keys"
echo ""
echo "2. Add Private Key to GitHub Secrets:"
echo "   - Go to: GitHub Repo → Settings → Secrets and variables → Actions"
echo "   - Add secret: EC2_SSH_PRIVATE_KEY"
echo "   - Value: $(cat ~/.ssh/github_actions_ec2)"
echo ""
echo "3. Add Other Secrets:"
echo "   - EC2_HOST: 54.165.116.208"
echo "   - EC2_DOMAIN: yourdomain.com (if you have one)"
echo "   - DB_PASSWORD: Wissen2024!Secure"
echo ""
echo "4. Test Deployment:"
echo "   - Push to main branch, or"
echo "   - Go to Actions → Deploy to AWS EC2 → Run workflow"
echo ""

