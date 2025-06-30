# TantraOS - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- VPS with at least 2GB RAM
- Domain name (optional but recommended)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd tantraos
```

### 2. Configure Environment
```bash
cp .env.production .env
nano .env  # Edit with your settings
```

### 3. Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Configuration

### Environment Variables
Edit `.env.production` with your settings:

- **Database**: Set secure passwords
- **JWT_SECRET**: Use a strong 32+ character secret
- **Email**: Configure SMTP settings
- **Domain**: Set your domain name

### SSL Certificates
- Self-signed certificates are generated automatically
- For production, replace with real certificates:
```bash
# Copy your certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

## 📊 Management Commands

### View Status
```bash
./monitor.sh
```

### Create Backup
```bash
./backup.sh
```

### Update Application
```bash
./update.sh
```

### View Logs
```bash
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

## 🔐 Security Features

- **SSL/TLS encryption**
- **Rate limiting**
- **Security headers**
- **Input validation**
- **SQL injection protection**
- **XSS protection**

## 📈 Monitoring

### Health Check
```bash
curl https://your-domain/health
```

### Container Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Permission errors**: Check file permissions
3. **Database connection**: Verify credentials in .env
4. **SSL errors**: Check certificate files

### Logs Location
- Application: `./logs/app.log`
- Nginx: `./logs/nginx/`
- Database: `docker-compose logs mysql`

## 🔄 Backup & Recovery

### Automatic Backups
Set up cron job:
```bash
crontab -e
# Add: 0 2 * * * /path/to/tantraos/backup.sh
```

### Manual Backup
```bash
./backup.sh
```

### Restore from Backup
```bash
# Stop services
docker-compose down

# Restore database
docker exec -i tantraos-mysql mysql -u root -p$DB_ROOT_PASSWORD tantraos < backup.sql

# Restore files
tar -xzf backup.tar.gz
cp -r uploads_backup/* uploads/

# Start services
docker-compose up -d
```

## 🌐 Production Checklist

- [ ] Configure real domain name
- [ ] Install real SSL certificates
- [ ] Set strong passwords
- [ ] Configure email settings
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all functionality
- [ ] Set up firewall rules

## 📞 Support

For issues and support, check the logs and monitoring output first.