# Quick Start (5 minutes)

## Step 1: Install & Configure (2 min)

```bash
# Clone or navigate to project
cd splash-helper-alerts

# Run setup (auto-installs dependencies)
bash setup.sh          # macOS/Linux
setup.bat             # Windows
```

**Or manual setup:**
```bash
npm install
cp .env.example .env
```

## Step 2: Get Your Join API Key (1 min)

1. Open **Join by joaoapps** app on your phone
2. Tap **Settings** (gear icon)
3. Look for **Devices** section
4. Tap your device → copy **API key**

## Step 3: Configure .env (1 min)

Open `.env` in your editor:

```bash
nano .env     # Linux/Mac
# or
notepad .env  # Windows
```

Update these lines:
```env
JOIN_API_KEY=paste_your_api_key_here
JOIN_DEVICE_ID=group.all
```

Optional - to filter alerts to specific characters:
```env
ACCOUNT_FILTER_ENABLED=true
ACCOUNT_FILTER_NAMES=YourCharacter,AltName
```

## Step 4: Test Locally (1 min)

Run the server:
```bash
npm run dev
```

You should see:
```
🚀 Webhook server running on port 3000
📍 Dink webhook: http://localhost:3000/webhook/dink
```

Test it works:
```bash
# In another terminal:
curl http://localhost:3000/health
```

Should respond with:
```json
{"status":"healthy","timestamp":"2026-07-06T..."}
```

## Step 5: Configure RuneLite Plugins

### Dink Plugin

1. Open RuneLite → Dink plugin settings
2. Find the webhook URL field
3. If testing locally: `http://localhost:3000/webhook/dink`
4. If deployed: `https://your-deployed-url/webhook/dink`
5. Save

### Watchdog Plugin

**For Splashing Alerts, create alerts like:**

**Alert 1: Low Fire Potion**
- Click **Watchdog** in RuneLite sidebar
- Click green **+** button
- Select **Game Message**
- Name: `Low Fire Potion`
- Trigger: In chat, search for `Your fire potion has expired`
- Add Action: **Dink**
- Message: `🔥 Fire potion expired!`
- Save

**Alert 2: AFK Detection**
- Name: `AFK Detected`
- Trigger: **Stat Changed** (Attack XP)
- Set condition: XP per minute < 2
- Add Action: **Dink**
- Message: `⏰ AFK Detected! Resume splashing`

## Step 6: Test End-to-End

1. **Start server:** `npm run dev`
2. **Trigger alert in RuneLite:**
   - In Watchdog, click the vial icon to manually trigger test alert
3. **Check phone:**
   - Join should show a notification
   - Tasker can automate from here

## Step 7: Deploy to Cloud

Pick one (recommended order):

### Option A: Railway (Easiest, Recommended)

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select `splash-helper-alerts` repo
5. Add environment variables:
   - `JOIN_API_KEY`: your key
   - `JOIN_DEVICE_ID`: `group.all`
6. Railway gives you URL like: `https://splash-helper-abc123.railway.app`
7. Update Dink with new URL

### Option B: Heroku

```bash
heroku create splash-helper-alerts
heroku config:set JOIN_API_KEY=your_key JOIN_DEVICE_ID=group.all
git push heroku main
heroku open
```

### Option C: Docker on VPS

```bash
# On VPS:
git clone your-repo
cd splash-helper-alerts
docker-compose up -d

# Check it's running:
docker-compose logs
```

### Option D: Just keep running locally

If your PC is always on, you can just keep the server running:

```bash
npm start      # Production mode
```

Use networking tools to expose `localhost:3000` to the internet:
- ngrok (easiest, free tier limits)
- Cloudflare Tunnel
- Port forwarding (requires static IP)

---

## Troubleshooting

### "Lost connection to Tasker"
- Verify Join API key is correct
- Test: `curl https://joinjoaoapps.appspot.com/sendNotification?apikey=YOUR_KEY&deviceId=group.all&title=Test&text=Hi`

### "Alerts not being received"
- Verify Dink webhook URL saved in settings
- Check RuneLite console for errors
- Test manually: `curl -X POST http://localhost:3000/webhook/dink -H "Content-Type: application/json" -d '{"playerName":"Test","type":"EXTERNAL_PLUGIN","content":"Test"}'`

### "Server crashed"
- Check logs: `tail -f logs/server.log`
- Common issue: Invalid JOIN_API_KEY in .env
- Restart: `npm run dev`

### "Can't access from phone"
- Localhost won't work from phone - **you must deploy**
- Use Railway/Heroku (easiest) or expose locally with ngrok

---

## Next Steps

1. ✅ Local testing works
2. ✅ Deploy to cloud
3. ✅ Configure Watchdog alerts for your splashing
4. ✅ (Optional) Set up Tasker automation on phone

**See README.md for full documentation & features**
