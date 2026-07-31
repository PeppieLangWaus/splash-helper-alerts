# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-06

### Added

**Core Features:**
- Express.js webhook server for receiving Dink alerts from RuneLite
- Integration with Join by joaoapps for sending notifications to Android devices
- Alert filtering by player account names
- Event type filtering (include/exclude specific Dink event types)
- Structured logging with file + console output
- Request tracking with unique IDs for debugging
- Health check endpoints

**Alert Processing:**
- Parse Dink webhook payloads (Watchdog external plugin events)
- Build Tasker-friendly notifications with title + body
- Extract and format relevant metadata (deaths, levels, loot, etc.)
- Truncation for mobile notification limits

**Integrations:**
- Join by joaoapps API client
  - Send notifications to specific device or all devices
  - Priority level support
  - Custom titles and messages

**Deployment:**
- Docker + Docker Compose configuration
- Dockerfile with health checks
- Comprehensive deployment guides for:
  - Railway.app (recommended)
  - Heroku
  - AWS Lambda
  - Self-hosted VPS with Docker
- Environment-based configuration
- Graceful shutdown handling

**Documentation:**
- README with full feature overview
- QUICKSTART.md for 5-minute setup
- DEPLOYMENT.md with step-by-step guides for each platform
- EXAMPLES.md with real payload examples for testing
- .env.example template with all configuration options
- Setup scripts (bash + batch) for easy initialization

**Development:**
- npm scripts for dev (with auto-reload) and production
- Logging utility for consistent output
- Configuration management module
- Alert processor for filtering and formatting

### Technical Details

**Stack:**
- Node.js 18+ / 20+
- Express.js 4.18
- Axios for HTTP requests
- dotenv for environment management
- UUID for request tracking

**Endpoints:**
- `GET /health` - Health check
- `GET /webhook/dink` - Webhook health check
- `POST /webhook/dink` - Receive Dink alerts

**Payload Support:**
- JSON alerts (application/json)
- Multipart alerts with screenshots (multipart/form-data)
- Dink event types: 25+ including DEATH, LEVEL, LOGIN, LOOT, etc.
- Watchdog external plugin events

**Configuration:**
- Account filtering (whitelist specific players)
- Event type filtering/exclusion
- Device targeting (single or all)
- Debug mode
- Production optimizations

### Future Enhancements (Not in v1.0)

- [ ] Webhook signature verification (HMAC-SHA256)
- [ ] Persistent store for alert history
- [ ] Web dashboard for monitor status and test alerts
- [ ] Notification templating system
- [ ] Rate limiting per account
- [ ] Scheduled alert summaries
- [ ] Discord integration (forward to Discord as well)
- [ ] Custom routing rules (different phones for different events)
- [ ] Alert acknowledgment tracking
- [ ] Backup webhook URLs for redundancy

---

## Notes for Users

This is the initial stable release with core functionality. The server is production-ready and can be deployed to any cloud platform or self-hosted.

**Known Limitations:**
- Dink rate limits are ~60 requests/minute per device
- Screenshots are not forwarded to Tasker (Tasker limitations)
- No persistent storage of alerts (stateless design)
- No built-in authentication (secure your deployment URL)

**Recommended Next Steps:**
1. Deploy to Railway or Heroku
2. Configure Watchdog alerts for splashing
3. Test with a few alerts
4. Set up Tasker automation for auto-responses if needed
