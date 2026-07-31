# Quick Reference Card

## Essential Commands

```bash
# Setup
npm install                    # Install dependencies
cp .env.example .env          # Create config
nano .env                     # Edit config with your Join API key

# Run
npm run dev                   # Development (auto-reload)
npm start                     # Production

# Test
curl http://localhost:3000/health                    # Health check
npm test                      # Run tests (when added)

# Deploy
git push heroku main          # Heroku
git push origin main          # Railway (auto-deploys from GitHub)
docker-compose up -d          # Docker
```

## Configuration

| Variable | What It Does | Example |
|----------|-------------|---------|
| `JOIN_API_KEY` | Phone notification API | `abc123def456` |
| `JOIN_DEVICE_ID` | Which phone receives alerts | `group.all` |
| `ACCOUNT_FILTER_ENABLED` | Only alert specific accounts | `true` |
| `ACCOUNT_FILTER_NAMES` | Which accounts to alert | `YourChar,Alt` |
| `EVENT_FILTER` | Only forward these events | `DEATH,LEVEL` |
| `EVENT_EXCLUDE` | Skip these events | `LOGIN,LOGOUT` |

## Testing Locally

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Send test alert
curl -X POST http://localhost:3000/webhook/dink \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestChar",
    "type": "EXTERNAL_PLUGIN",
    "content": "Test alert",
    "extra": {}
  }'

# Check logs
tail -f logs/server.log
```

## Dink Plugin Setup

In RuneLite → Dink settings:
1. Webhook URL: `http://localhost:3000/webhook/dink` (local)
2. Or: `https://your-deployed-url/webhook/dink` (production)
3. Save

## Watchdog Alert Setup

In RuneLite → Watchdog:
1. Create new alert
2. Set trigger (e.g., "Fire potion expired")
3. Add Action → **Dink**
4. Write message (e.g., "🔥 Fire potion expired!")
5. Save and test with vial icon

## Deployment Quick Links

- **Railway**: [railway.app](https://railway.app) (easiest)
- **Heroku**: [heroku.com](https://heroku.com)
- **AWS**: [aws.amazon.com](https://aws.amazon.com)
- **Join**: [joaoapps.com/join](https://joaoapps.com/join)

## Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check (always up? 200 = yes) |
| `/webhook/dink` | GET | Check webhook is ready |
| `/webhook/dink` | POST | Receive Dink alerts |

## Logs

```bash
tail -f logs/server.log           # Watch logs
grep "error" logs/server.log      # Find errors
grep "joined" logs/server.log     # Find successful forwards
```

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Join API key not configured" | Add `JOIN_API_KEY` to .env |
| "502 Bad Gateway" | Check Join API key is valid |
| "Alerts not arriving" | Verify Dink webhook URL saved in settings |
| "Server won't start" | Check `.env` syntax, verify Node.js installed |
| "Can't access from phone" | Must deploy - localhost won't work over internet |

## File Overview

**Core:**
- `src/server.js` - Main Express server
- `src/routes/dink.js` - Webhook endpoint
- `src/integrations/join.js` - Join API client
- `src/processors/alertProcessor.js` - Alert filtering

**Config:**
- `.env` - Your configuration (create from `.env.example`)
- `src/config.js` - Config management

**Deployment:**
- `Dockerfile` - Docker image
- `docker-compose.yml` - Docker Compose
- `package.json` - Node dependencies

**Docs:**
- `README.md` - Full documentation
- `QUICKSTART.md` - 5-minute setup ⭐
- `DEPLOYMENT.md` - Cloud deployment
- `EXAMPLES.md` - Payload examples
- `ARCHITECTURE.md` - System design

---

## First 5 Minutes

1. `npm install`
2. `cp .env.example .env`
3. Get Join API key from your phone
4. Edit `.env` with API key
5. `npm run dev`
6. `curl http://localhost:3000/health`
7. ✓ Done!

---

**Lost?** Start with [QUICKSTART.md](QUICKSTART.md)

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md)

**Want to understand more?** Read [ARCHITECTURE.md](ARCHITECTURE.md)
