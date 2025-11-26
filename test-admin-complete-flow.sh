#!/bin/bash

# Universal Publishers Admin Panel - Complete Flow Test Script
# This script tests the entire admin system end-to-end

echo "🚀 Universal Publishers Admin Panel - Complete Flow Test"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ to continue."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm to continue."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    else
        print_error "Frontend directory not found"
        exit 1
    fi
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
    else
        print_error "Backend directory not found"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if [ -d "backend" ]; then
        cd backend
        
        # Check if Prisma is installed
        if ! npx prisma --version &> /dev/null; then
            print_error "Prisma CLI not found. Installing Prisma..."
            npm install prisma @prisma/client
        fi
        
        # Generate Prisma client
        print_status "Generating Prisma client..."
        npx prisma generate
        
        # Run migrations
        print_status "Running database migrations..."
        npx prisma migrate dev --name init
        
        # Seed database
        print_status "Seeding database..."
        npx prisma db seed
        
        cd ..
        print_success "Database setup completed"
    else
        print_error "Backend directory not found"
        exit 1
    fi
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    
    if [ -d "backend" ]; then
        cd backend
        npm run start:dev &
        BACKEND_PID=$!
        cd ..
        
        # Wait for backend to start
        print_status "Waiting for backend to start..."
        sleep 10
        
        # Check if backend is running
        if curl -s http://localhost:3001 > /dev/null; then
            print_success "Backend server started successfully on port 3001"
        else
            print_warning "Backend server may not be ready yet. Continuing..."
        fi
    else
        print_error "Backend directory not found"
        exit 1
    fi
}

# Start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    
    if [ -d "frontend" ]; then
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        # Wait for frontend to start
        print_status "Waiting for frontend to start..."
        sleep 15
        
        # Check if frontend is running
        if curl -s http://localhost:3000 > /dev/null; then
            print_success "Frontend server started successfully on port 3000"
        else
            print_warning "Frontend server may not be ready yet. Continuing..."
        fi
    else
        print_error "Frontend directory not found"
        exit 1
    fi
}

# Test admin flow
test_admin_flow() {
    print_status "Testing admin flow..."
    
    # Install puppeteer for testing
    if [ ! -f "test-package.json" ]; then
        print_error "Test package.json not found"
        return 1
    fi
    
    # Install test dependencies
    print_status "Installing test dependencies..."
    npm install puppeteer --save-dev
    
    # Run the test
    print_status "Running end-to-end tests..."
    node test-admin-flow.js
    
    if [ $? -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed. Check the test report."
    fi
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 Universal Publishers Admin Panel is ready!"
    echo "=============================================="
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Admin Login: http://localhost:3000/admin/login"
    echo "   Backend API: http://localhost:3001"
    echo ""
    echo "🔐 Demo Credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "📊 Admin Features:"
    echo "   ✅ Dashboard with statistics"
    echo "   ✅ Journal management (CRUD)"
    echo "   ✅ Article management and review"
    echo "   ✅ Analytics dashboard"
    echo "   ✅ Content management for journal pages"
    echo "   ✅ Search and filtering"
    echo ""
    echo "🧪 Testing:"
    echo "   Run: node test-admin-flow.js"
    echo "   Report: test-report.json"
    echo ""
    echo "🛑 To stop servers:"
    echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    print_success "Cleanup completed"
}

# Main execution
main() {
    # Set up signal handlers for cleanup
    trap cleanup EXIT INT TERM
    
    print_status "Starting Universal Publishers Admin Panel setup..."
    
    # Check prerequisites
    check_node
    check_npm
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Start servers
    start_backend
    start_frontend
    
    # Test admin flow
    test_admin_flow
    
    # Show access information
    show_access_info
    
    # Keep script running
    print_status "Servers are running. Press Ctrl+C to stop."
    wait
}

# Run main function
main "$@"
