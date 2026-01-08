#!/bin/bash
# Check EC2 instance status via AWS CLI
# Run this from your local machine with AWS CLI configured

echo "=========================================="
echo "🔍 EC2 Instance Status Check"
echo "=========================================="
echo ""

# Get instance ID (you may need to update this)
INSTANCE_ID="i-016ab2b939f5f7a3b"
INSTANCE_IP="54.165.116.208"

echo "1. Instance Status:"
aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,PrivateIpAddress]' --output table
echo ""

echo "2. Security Group Rules:"
SG_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text)
echo "Security Group ID: $SG_ID"
aws ec2 describe-security-groups --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissions' --output table
echo ""

echo "3. Network Interfaces:"
aws ec2 describe-network-interfaces --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" --query 'NetworkInterfaces[0].[Status,Association.PublicIp,PrivateIpAddress]' --output table
echo ""

echo "4. Testing Connectivity:"
echo "Testing SSH (port 22):"
timeout 3 bash -c "</dev/tcp/$INSTANCE_IP/22" 2>/dev/null && echo "✅ SSH port 22 is open" || echo "❌ SSH port 22 is closed"
echo ""

echo "Testing HTTP (port 80):"
timeout 3 bash -c "</dev/tcp/$INSTANCE_IP/80" 2>/dev/null && echo "✅ HTTP port 80 is open" || echo "❌ HTTP port 80 is closed"
echo ""

echo "Testing Backend (port 3001 via HTTP):"
curl -s -o /dev/null -w "HTTP %{http_code}\n" --connect-timeout 3 http://$INSTANCE_IP/api/health 2>/dev/null || echo "❌ Backend not accessible"
echo ""

echo "Testing Frontend:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" --connect-timeout 3 http://$INSTANCE_IP/ 2>/dev/null || echo "❌ Frontend not accessible"
echo ""

echo "=========================================="
echo "💡 If ports are closed, check Security Group rules"
echo "💡 Security Group should allow:"
echo "   - SSH (22) from your IP"
echo "   - HTTP (80) from 0.0.0.0/0"
echo "   - HTTPS (443) from 0.0.0.0/0 (if using SSL)"
echo "=========================================="

