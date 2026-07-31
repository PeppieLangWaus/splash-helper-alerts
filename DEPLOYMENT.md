# Deployment Guide

## Quick Deploy Options

### 1. Railway.app (Easiest - Free/Paid)

#### Prerequisites
- GitHub account
- Railway account (free tier: $5/month credits)

#### Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/splash-helper-alerts.git
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your `splash-helper-alerts` repo
   - Click "Deploy"

3. **Add Environment Variables**
   - In Railway dashboard, go to project
   - Click "Variables"
   - Add:
     - `JOIN_API_KEY`: Your Join API key
     - `JOIN_DEVICE_ID`: `group.all` or specific device ID
     - `NODE_ENV`: `production`
     - (Optional) `ACCOUNT_FILTER_ENABLED`: `true`
     - (Optional) `ACCOUNT_FILTER_NAMES`: `YourChar,AltName`

4. **Get Your Webhook URL**
   - Railway generates: `https://splash-helper-alerts-production.up.railway.app`
   - Copy this URL for Dink plugin settings

5. **Monitor Logs**
   - In Railway dashboard → Deployments tab
   - Click active deployment to see live logs

#### Cost
- Free tier: $5/month (usually sufficient)
- Each project gets 512MB RAM + shared CPU

---

### 2. Heroku (Traditional - Paid Only)

#### Prerequisites
- Heroku CLI installed
- Heroku account (free tier discontinued, paid plans start $7/month)

#### Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create splash-helper-alerts

# Add buildpack (already detected from package.json)
# Optional: heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set JOIN_API_KEY=your_actual_key_here
heroku config:set JOIN_DEVICE_ID=group.all
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Check logs
heroku logs --tail

# Your URL: https://splash-helper-alerts.herokuapp.com
```

#### Commands
```bash
heroku open                    # Open app in browser
heroku logs --tail             # View logs
heroku config                  # View all variables
heroku config:unset VAR_NAME   # Remove variable
```

---

### 3. AWS Lambda + API Gateway (Serverless)

#### Prerequisites
- AWS account
- AWS CLI configured

#### Steps

1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   ```

2. **Create serverless config**
   ```bash
   serverless create --template aws-nodejs --path splash-helper
   ```

3. **Deploy**
   ```bash
   serverless deploy \
     --param="joinApiKey=YOUR_KEY" \
     --param="joinDeviceId=group.all"
   ```

4. **Get endpoint URL from Serverless output**

#### Cost
- Lambda: Free tier ~1M requests/month
- API Gateway: ~3.5M requests/month free
- Very cost-effective for low traffic

---

### 4. Docker on VPS (Full Control)

#### Prerequisites
- VPS (DigitalOcean, Linode, Vultr, etc.)
- Docker + Docker Compose installed
- Domain name (optional, for HTTPS)

#### Steps

1. **SSH into your VPS**
   ```bash
   ssh root@your_vps_ip
   ```

2. **Clone repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/splash-helper-alerts.git
   cd splash-helper-alerts
   ```

3. **Create .env**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Check logs**
   ```bash
   docker-compose logs -f
   ```

6. **Your URL**
   - `http://your_vps_ip:3000` or
   - `https://your-domain.com` (with Nginx reverse proxy + SSL)

#### Nginx Reverse Proxy (Optional SSL)

```bash
# Install Nginx
apt-get install nginx

# Create /etc/nginx/sites-available/splash-helper
# (See nginx.conf example below)

# Enable site
ln -s /etc/nginx/sites-available/splash-helper /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Add SSL with Certbot
apt-get install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoring & Troubleshooting

### Check Server Status

```bash
# Health check endpoint
curl https://YOUR_DEPLOYED_URL/health

# Should return:
# {"status":"healthy","timestamp":"2026-07-06T..."}
```

### Test Webhook

```bash
curl -X POST https://YOUR_DEPLOYED_URL/webhook/dink \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestUser",
    "type": "EXTERNAL_PLUGIN",
    "content": "Test alert from deployment",
    "extra": {}
  }'

# Should return success with forwarded alert info
```

### View Logs

**Railway:**
- Dashboard → Deployments tab → click active deployment

**Heroku:**
```bash
heroku logs --tail
```

**Docker VPS:**
```bash
docker-compose logs -f
# or
tail -f ./logs/server.log
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Server crashed - check logs, restart with `docker-compose restart` |
| JOIN_API_KEY not working | Verify key in Join app, regenerate if needed |
| Notifications not arriving | Check Join app permissions, test with curl |
| High latency | Check network, consider region closer to you |
| Server doesn't start | Check logs for missing env vars or syntax errors |

---

## Environment Variables Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `NODE_ENV` | No | development | `production` |
| `PORT` | No | 3000 | `3000` |
| `JOIN_API_KEY` | **Yes** | - | `abc123def456...` |
| `JOIN_DEVICE_ID` | No | `group.all` | `group.all` or device ID |
| `ACCOUNT_FILTER_ENABLED` | No | `false` | `true` |
| `ACCOUNT_FILTER_NAMES` | No | - | `YourChar,AltName` |
| `EVENT_FILTER` | No | (all) | `DEATH,LEVEL,LOGIN` |
| `EVENT_EXCLUDE` | No | - | `LOGIN,LOGOUT` |
| `DEBUG` | No | `false` | `true` |

---

## Performance & Limits

| Metric | Value |
|--------|-------|
| Request latency | 100-300ms |
| Max payload | 50MB |
| Daily alerts | Unlimited* |
| Join rate limit | ~60/minute per device |

*Depends on your plan:
- Railway free: $5/month (usually sufficient)
- Heroku eco: $7/month minimum
- AWS Lambda: $0.20 per million requests

---

## SSL/HTTPS

Most cloud platforms include free HTTPS:
- **Railway**: Automatic HTTPS with *.railway.app domain
- **Heroku**: Automatic HTTPS with *.herokuapp.com domain
- **AWS**: Use CloudFront + ACM for free SSL
- **Your VPS**: Use Let's Encrypt (free with Certbot)

Configure Dink with `https://` URLs for all deployments.

---

## Updating

To deploy updates:

**Railway:**
- Push to GitHub → Railway redeploys automatically

**Heroku:**
```bash
git push heroku main
```

**Docker VPS:**
```bash
git pull
docker-compose up -d --build
```

---

## Backup & Recovery

**Save your logs:**
```bash
# Railway: Download from dashboard
# Heroku: heroku logs --tail > backup.log
# Docker: cp ./logs ./logs-backup
```

**Environment variables:**
```bash
# Heroku: heroku config > backup-config.txt
# Railway: Export from dashboard
# Docker: Save .env file securely
```

---

## Support

If deployment fails:
1. Check logs for error messages
2. Verify all environment variables are set
3. Test service independently (`curl` to webhook URL)
4. Restart service and retry
5. Check GitHub issues if persists
