# Quick Start Guide

## Installation

Add this to `.github/workflows/release-notify.yml`:

```yaml
name: 'Announce release'

on:
  release:
    types: [published]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: titenkov/action-release@v1
        with:
          slack-webhook-url: ${{ secrets.SLACK_RELEASES_WEBHOOK }}
```

## Setup Slack Webhook

1. Go to https://api.slack.com/apps
2. Create app → "From scratch"
3. Activate "Incoming Webhooks"
4. Add webhook to channel
5. Copy webhook URL
6. Add to GitHub repo secrets as `SLACK_RELEASES_WEBHOOK`

## Common Use Cases

### Custom Title
```yaml
with:
  slack-webhook-url: ${{ secrets.SLACK_RELEASES_WEBHOOK }}
  slack-title: '🎉 New version available!'
```

### Different Channel
```yaml
with:
  slack-webhook-url: ${{ secrets.SLACK_RELEASES_WEBHOOK }}
  slack-channel: '#announcements'
```

### Custom Bot Identity
```yaml
with:
  slack-webhook-url: ${{ secrets.SLACK_RELEASES_WEBHOOK }}
  slack-username: 'Deploy Bot'
  slack-icon-emoji: ':package:'
```

## Local Testing

```bash
# Install dependencies
npm install

# Test with act
act release -e test-event.json --secret SLACK_WEBHOOK_URL=your-webhook

# Modify test-event.json to simulate different releases
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No notification sent | Check secret name is `SLACK_RELEASES_WEBHOOK` |
| Wrong channel | Verify webhook channel or use `slack-channel` input |
| Formatting issues | Check release body markdown syntax |
| Action fails | Review Actions logs for error messages |

## What Gets Converted

The action automatically converts GitHub markdown to Slack format:

- `**bold**` → **bold**
- `[link](url)` → clickable link
- `## Heading` → *Heading*
- Lists, code blocks, etc.
