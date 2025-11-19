# action-release

[![Status](https://img.shields.io/badge/status-active-blue.svg?logo=git)](https://github.com/titenkov/action-release)
[![License](https://img.shields.io/badge/license-mit-blue.svg?logo=open-source-initiative)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/sponsor-titenkov-blue.svg?logo=github-sponsors&style=social)](https://github.com/sponsors/titenkov)

GitHub Action to send Slack notifications for published releases with automatic markdown-to-slack formatting.

![Screenshot](screenshot-v1.png 'Screenshot')

## Features

- 🚀 **Single-step solution**
- 📝 **Automatic formatting**
- 🎨 **Customizable**
- 🔗 **Release context**

## Usage

### Basic Example

```yaml
name: 'Announce release'

on:
  release:
    types:
      - published

jobs:
  slack-notify:
    name: Notify Slack on release
    runs-on: ubuntu-latest
    steps:
      - name: Send release notification to Slack
        uses: titenkov/action-release@v1
        with:
          slack-webhook-url: ${{ secrets.SLACK_RELEASES_WEBHOOK }}
```

### Advanced Example

```yaml
name: 'Announce release'

on:
  release:
    types:
      - published

jobs:
  slack-notify:
    name: Notify Slack on release
    runs-on: ubuntu-latest
    steps:
      - name: Send release notification to Slack
        uses: titenkov/action-release@v1
        with:
          slack-webhook-url: ${{ secrets.SLACK_RELEASES_WEBHOOK }}
          slack-title: '🎉 New Release: ${{ github.event.release.tag_name }}'
          slack-channel: '#releases'
          slack-username: 'Release Bot'
          slack-icon-emoji: ':rocket:'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `slack-webhook-url` | Slack webhook URL for notifications | ✅ Yes | - |
| `release-tag` | Release tag name | No | `${{ github.event.release.tag_name }}` |
| `release-url` | Release URL | No | `${{ github.event.release.html_url }}` |
| `release-body` | Release body/notes | No | `${{ github.event.release.body }}` |
| `repository-name` | Repository name | No | `${{ github.repository }}` |
| `slack-title` | Custom Slack notification title | No | `{repo} {tag} is released! 💪🍾` |
| `slack-channel` | Slack channel (overrides webhook default) | No | - |
| `slack-username` | Bot username for Slack message | No | `Release Bot` |
| `slack-icon-emoji` | Emoji icon for bot | No | `:rocket:` |

## Outputs

| Output | Description |
|--------|-------------|
| `slack-message` | The formatted Slack message that was sent |

## Setup

1. Create a Slack webhook:
   - Go to https://api.slack.com/apps
   - Create a new app or select an existing one
   - Enable "Incoming Webhooks"
   - Create a webhook for your channel
   - Copy the webhook URL

2. Add the webhook to your repository secrets:
   - Go to your repository Settings → Secrets and variables → Actions
   - Create a new secret named `SLACK_RELEASES_WEBHOOK`
   - Paste your webhook URL

3. Create a workflow file (`.github/workflows/release-notify.yml`) with the usage example above

## Development

### Install dependencies
```bash
npm install
```

### Testing locally
You can test the action locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run the release event
act release -e test.json --secret SLACK_WEBHOOK_URL=your-webhook-url
```

## License

The project is released under the terms of the MIT License.