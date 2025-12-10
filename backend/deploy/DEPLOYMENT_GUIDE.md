# 🚀 HƯỚNG DẪN DEPLOY PRODUCTION

## Kiến Trúc Bảo Mật Enterprise

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Cloudflare │────▶│    Nginx    │────▶│  PM2 Cluster │────▶│  MongoDB   │
│   (CDN/WAF) │     │ Rate Limit  │     │   (4 cores)  │     │   Atlas    │
└─────────────┘     └─────────────┘     └──────┬───────┘     └────────────┘
                                               │
                                        ┌──────▼───────┐
                                        │    Redis     │
                                        │ (Cache/Rate) │
                                        └──────────────┘
```

---

## Bước 1: Mua VPS

**Cấu hình tối thiểu:**
- 2 CPU Cores
- 4GB RAM
- 40GB SSD
- Ubuntu 22.04 LTS

**Nhà cung cấp đề xuất (Việt Nam):**
- Tinohost: ~200k/tháng
- Vultr Singapore: ~$12/tháng
- DigitalOcean Singapore: ~$12/tháng

---

## Bước 2: Setup VPS

```bash
# SSH vào VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install Nginx
apt install nginx -y

# Install PM2 (global)
npm install -g pm2
```

---

## Bước 3: Deploy với Docker

```bash
# Clone repo
git clone https://github.com/NguyenManhNinh/NMN-CENIMA.git
cd NMN-CENIMA/backend

# Tạo .env (copy từ .env.example)
cp .env.example .env
nano .env  # Sửa các credentials thật

# Build & Run
docker-compose up -d --build

# Kiểm tra
docker-compose ps
docker-compose logs -f backend
```

---

## Bước 4: Cấu hình Nginx

```bash
# Copy nginx config
cp deploy/nginx.conf /etc/nginx/sites-available/nmn-cinema

# Enable site
ln -s /etc/nginx/sites-available/nmn-cinema /etc/nginx/sites-enabled/

# Remove default
rm /etc/nginx/sites-enabled/default

# Test & Reload
nginx -t
systemctl reload nginx
```

---

## Bước 5: SSL với Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
certbot --nginx -d api.nmncinema.com

# Auto renew (đã tự động setup bởi certbot)
```

---

## Bước 6: Cloudflare Setup

1. Đăng ký tài khoản tại cloudflare.com
2. Add site: nmncinema.com
3. Đổi Nameservers về Cloudflare
4. Bật "Proxied" (đám mây cam) cho DNS record
5. SSL/TLS: Full (strict)
6. Under Attack Mode: Bật khi bị tấn công

---

## PM2 Commands (nếu không dùng Docker)

```bash
# Start cluster mode
pm2 start ecosystem.config.js --env production

# Xem logs
pm2 logs

# Monitor
pm2 monit

# Restart
pm2 reload all

# Save config (auto-start on reboot)
pm2 save
pm2 startup
```

---

## Các Files Đã Tạo

| File | Mô tả |
|------|-------|
| `src/services/redisService.js` | Redis connection & helpers |
| `src/middlewares/rateLimitMiddleware.js` | Rate limit với Redis store |
| `src/middlewares/cacheMiddleware.js` | API response caching |
| `ecosystem.config.js` | PM2 cluster configuration |
| `deploy/nginx.conf` | Nginx reverse proxy config |

---

## Security Features Implemented

✅ Rate limiting với Redis (cluster-safe)
✅ API response caching
✅ Compression (gzip)
✅ Security headers (Helmet)
✅ HPP protection
✅ Nginx rate limiting (backup layer)
✅ PM2 cluster mode ready
✅ Redis persistence
