#!/bin/bash

# EC2 Management Commands for Wissen Publication Group
# Use with: aws --profile wissen-user

# Configuration
PROFILE="wissen-user"
REGION="us-east-1"
INSTANCE_NAME="wissen-publication-group"
KEY_NAME="wissen-keypair"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 EC2 Management Commands${NC}"
echo ""

# Function to list instances
list_instances() {
    echo -e "${YELLOW}📋 Listing EC2 Instances:${NC}"
    aws ec2 describe-instances \
        --profile $PROFILE \
        --region $REGION \
        --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,InstanceType,Tags[?Key==`Name`].Value|[0]]' \
        --output table
}

# Function to get instance by name
get_instance_by_name() {
    INSTANCE_ID=$(aws ec2 describe-instances \
        --profile $PROFILE \
        --region $REGION \
        --filters "Name=tag:Name,Values=$INSTANCE_NAME" "Name=instance-state-name,Values=running,stopped" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text)
    
    if [ "$INSTANCE_ID" != "None" ] && [ -n "$INSTANCE_ID" ]; then
        echo $INSTANCE_ID
    else
        echo ""
    fi
}

# Function to start instance
start_instance() {
    INSTANCE_ID=$(get_instance_by_name)
    if [ -z "$INSTANCE_ID" ]; then
        echo -e "${RED}❌ Instance not found with name: $INSTANCE_NAME${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}▶️  Starting instance: $INSTANCE_ID${NC}"
    aws ec2 start-instances \
        --instance-ids $INSTANCE_ID \
        --profile $PROFILE \
        --region $REGION
    
    echo -e "${GREEN}✅ Instance starting...${NC}"
    echo "Waiting for instance to be running..."
    aws ec2 wait instance-running \
        --instance-ids $INSTANCE_ID \
        --profile $PROFILE \
        --region $REGION
    
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --profile $PROFILE \
        --region $REGION \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    echo -e "${GREEN}✅ Instance is running!${NC}"
    echo -e "${GREEN}🌐 Public IP: $PUBLIC_IP${NC}"
}

# Function to stop instance
stop_instance() {
    INSTANCE_ID=$(get_instance_by_name)
    if [ -z "$INSTANCE_ID" ]; then
        echo -e "${RED}❌ Instance not found with name: $INSTANCE_NAME${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⏹️  Stopping instance: $INSTANCE_ID${NC}"
    aws ec2 stop-instances \
        --instance-ids $INSTANCE_ID \
        --profile $PROFILE \
        --region $REGION
    
    echo -e "${GREEN}✅ Instance stopping...${NC}"
}

# Function to get instance IP
get_instance_ip() {
    INSTANCE_ID=$(get_instance_by_name)
    if [ -z "$INSTANCE_ID" ]; then
        echo -e "${RED}❌ Instance not found with name: $INSTANCE_NAME${NC}"
        exit 1
    fi
    
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --profile $PROFILE \
        --region $REGION \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    echo -e "${GREEN}🌐 Public IP: $PUBLIC_IP${NC}"
}

# Function to SSH to instance
ssh_to_instance() {
    INSTANCE_ID=$(get_instance_by_name)
    if [ -z "$INSTANCE_ID" ]; then
        echo -e "${RED}❌ Instance not found with name: $INSTANCE_NAME${NC}"
        exit 1
    fi
    
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --profile $PROFILE \
        --region $REGION \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "None" ]; then
        echo -e "${RED}❌ Instance is not running or has no public IP${NC}"
        exit 1
    fi
    
    KEY_FILE="$HOME/.ssh/${KEY_NAME}.pem"
    if [ ! -f "$KEY_FILE" ]; then
        echo -e "${RED}❌ Key file not found: $KEY_FILE${NC}"
        echo "Please download your key pair from EC2 console"
        exit 1
    fi
    
    echo -e "${GREEN}🔐 Connecting to instance...${NC}"
    ssh -i "$KEY_FILE" ubuntu@$PUBLIC_IP
}

# Function to launch new instance
launch_instance() {
    echo -e "${YELLOW}🚀 Launching new EC2 instance...${NC}"
    
    # Get latest Ubuntu 22.04 AMI
    AMI_ID=$(aws ec2 describe-images \
        --owners 099720109477 \
        --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
        --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
        --output text \
        --profile $PROFILE \
        --region $REGION)
    
    echo "Using AMI: $AMI_ID"
    
    # Launch instance
    aws ec2 run-instances \
        --image-id $AMI_ID \
        --instance-type t3.small \
        --key-name $KEY_NAME \
        --security-group-ids $(aws ec2 describe-security-groups \
            --filters "Name=group-name,Values=wissen-app-sg" \
            --query 'SecurityGroups[0].GroupId' \
            --output text \
            --profile $PROFILE \
            --region $REGION) \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
        --profile $PROFILE \
        --region $REGION
    
    echo -e "${GREEN}✅ Instance launch initiated!${NC}"
}

# Main menu
case "$1" in
    list)
        list_instances
        ;;
    start)
        start_instance
        ;;
    stop)
        stop_instance
        ;;
    ip)
        get_instance_ip
        ;;
    ssh)
        ssh_to_instance
        ;;
    launch)
        launch_instance
        ;;
    *)
        echo "Usage: $0 {list|start|stop|ip|ssh|launch}"
        echo ""
        echo "Commands:"
        echo "  list    - List all EC2 instances"
        echo "  start   - Start the wissen-publication-group instance"
        echo "  stop    - Stop the wissen-publication-group instance"
        echo "  ip      - Get public IP of instance"
        echo "  ssh     - SSH into the instance"
        echo "  launch  - Launch a new instance"
        exit 1
        ;;
esac

