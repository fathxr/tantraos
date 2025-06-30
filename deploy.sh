#!/bin/bash

# TantraOS Production Deployment Script
set -e

echo "🚀 Starting TantraOS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs/nginx
mkdir -p uploads
mkdir -p nginx/ssl

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.production.example to .env.production and configure it.${NC}"
    exit 1
fi

# Copy environment file
cp .env.production .env

# Generate SSL certificates if they don't exist
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo -e "${YELLOW}🔐 Generating self-signed SSL certificates...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=IL/ST=Tel Aviv/L=Tel Aviv/O=TantraOS/CN=localhost"
    echo -e "${GREEN}✅ SSL certificates generated${NC}"
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker-compose pull

# Build and start containers
echo -e "${YELLOW}🔨 Building and starting containers...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services are running!${NC}"
    
    # Show running containers
    echo -e "${YELLOW}📊 Container status:${NC}"
    docker-compose ps
    
    # Show logs
    echo -e "${YELLOW}📝 Recent logs:${NC}"
    docker-compose logs --tail=20
    
    echo -e "${GREEN}🎉 TantraOS deployed successfully!${NC}"
    echo -e "${GREEN}🌐 Application is available at: https://your-server-ip${NC}"
    echo -e "${GREEN}📊 Health check: https://your-server-ip/health${NC}"
    
else
    echo -e "${RED}❌ Some services failed to start. Check logs:${NC}"
    docker-compose logs
    exit 1
fi