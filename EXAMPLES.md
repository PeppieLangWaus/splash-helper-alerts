# Example Dink Payloads

These are real payload examples from Dink that your webhook will receive.

## External Plugin Alert (from Watchdog)

This is what Watchdog sends via Dink when an alert is triggered:

```json
{
  "playerName": "YourCharacter",
  "type": "EXTERNAL_PLUGIN",
  "content": "🔥 Fire potion expired!",
  "extra": {
    "message": "Your fire potion has expired"
  },
  "accountType": "NORMAL",
  "seasonalWorld": false,
  "dinkAccountHash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
  "embeds": []
}
```

## Death Alert

```json
{
  "playerName": "IronmAN",
  "type": "DEATH",
  "content": "Died at Ardougne Knight spot",
  "extra": {
    "valueLost": 50000,
    "isPvp": false,
    "killerName": "Ardougne Knight",
    "location": "Ardougne",
    "lostItems": [
      {
        "name": "Rune platebody",
        "quantity": 1,
        "id": 1381,
        "priceEach": 38000
      }
    ],
    "keptItems": []
  },
  "accountType": "IRONMAN",
  "seasonalWorld": false,
  "dinkAccountHash": "...",
  "embeds": []
}
```

## Level Alert

```json
{
  "playerName": "YourCharacter",
  "type": "LEVEL",
  "content": "Reached Level 50 Magic!",
  "extra": {
    "levelledSkills": {
      "Magic": 50
    },
    "allSkills": {
      "Attack": 60,
      "Defence": 55,
      "Strength": 60,
      "Hitpoints": 60,
      "Magic": 50,
      "Ranged": 50,
      "Prayer": 45,
      "Cooking": 40,
      "Woodcutting": 50,
      "Fletching": 45,
      "Fishing": 35,
      "Firemaking": 30,
      "Crafting": 35,
      "Smithing": 40,
      "Mining": 45,
      "Herblore": 30,
      "Agility": 40,
      "Thieving": 30,
      "Slayer": 50,
      "Farming": 25,
      "Runecraft": 20,
      "Hunter": 15,
      "Construction": 10
    },
    "combatLevel": 59
  },
  "accountType": "NORMAL",
  "seasonalWorld": false,
  "dinkAccountHash": "...",
  "embeds": []
}
```

## Login Alert

```json
{
  "playerName": "YourCharacter",
  "type": "LOGIN",
  "content": "YourCharacter has logged in",
  "extra": {
    "totalLevel": 1000,
    "questPoints": 150,
    "minimapLevel": 138,
    "combatLevel": 138,
    "isUnlockedHardMode": true,
    "unlockedCombatAchievements": 45
  },
  "accountType": "NORMAL",
  "seasonalWorld": false,
  "dinkAccountHash": "...",
  "embeds": []
}
```

## Loot Alert

```json
{
  "playerName": "YourCharacter",
  "type": "LOOT",
  "content": "Received loot from Chest: Dragon Halberd, Rune knife",
  "extra": {
    "source": "Chest",
    "items": [
      {
        "name": "Dragon Halberd",
        "quantity": 1,
        "id": 3204,
        "priceEach": 150000
      },
      {
        "name": "Rune knife",
        "quantity": 3,
        "id": 4801,
        "priceEach": 5000
      }
    ],
    "killCount": 150,
    "rarestItem": "Dragon Halberd",
    "rarestProbability": 0.01,
    "party": []
  },
  "accountType": "NORMAL",
  "seasonalWorld": false,
  "dinkAccountHash": "...",
  "embeds": []
}
```

## Testing Your Webhook

### Test with curl

**Test External Plugin (Watchdog):**
```bash
curl -X POST http://localhost:3000/webhook/dink \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "YourCharacter",
    "type": "EXTERNAL_PLUGIN",
    "content": "🔥 Fire potion expired!",
    "extra": {},
    "accountType": "NORMAL",
    "seasonalWorld": false,
    "dinkAccountHash": "abc123def456",
    "embeds": []
  }'
```

**Test Death Alert:**
```bash
curl -X POST http://localhost:3000/webhook/dink \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "type": "DEATH",
    "content": "Died at Ardougne Knight",
    "extra": {
      "valueLost": 50000,
      "location": "Ardougne"
    },
    "accountType": "IRONMAN",
    "seasonalWorld": false,
    "dinkAccountHash": "abc123",
    "embeds": []
  }'
```

### Sample Response

Successful forward:
```json
{
  "success": true,
  "message": "Alert forwarded to Tasker",
  "alert": {
    "playerName": "YourCharacter",
    "eventType": "EXTERNAL_PLUGIN",
    "title": "YourCharacter - EXTERNAL_PLUGIN",
    "text": "🔥 Fire potion expired!"
  }
}
```

Filtered (skipped):
```json
{
  "skipped": true,
  "reason": "Alert filtered"
}
```

---

## Creating Test Payloads from Watchdog

In Watchdog plugin:
1. Create your alert
2. Click the vial icon (force trigger)
3. Watch your server logs for the webhook delivery

Check logs:
```bash
tail -f logs/server.log
```

---

## Common Dink Event Types

| Type | Trigger | Extra Data |
|------|---------|-----------|
| EXTERNAL_PLUGIN | Custom (Watchdog) | Varies |
| DEATH | Character dies | valueLost, location, killer |
| LEVEL | Skill level gained | levelledSkills, combatLevel |
| LOGIN | Player logs in | totalLevel, questPoints |
| LOGOUT | Player logs out | totalLevel |
| LOOT | Item drop | items, source, rarestItem |
| PET | Pet obtained | petName |
| SLAYER | Slayer related | taskName, taskCount |
| KILL_COUNT | Boss killed | boss, count, isPersonalBest |
| XP_MILESTONE | Hit XP amount | skill, xp |

See [Dink documentation](https://github.com/pajlads/DinkPlugin) for full list.
