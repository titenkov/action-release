# GitHub Action Development Guide: action-release

## Architecture Overview

**Purpose**: Single-step GitHub Action that sends Slack notifications for published releases, combining markdown-to-slack conversion and webhook posting.

**Key Components**:
- `index.js` - Main action logic (Node.js 20)
- `action.yml` - Action metadata and input/output definitions
- `package.json` - Dependencies: `@actions/core`, `@actions/github`, `slackify-markdown`
- `node_modules/` - **MUST be committed** to git for the action to work (GitHub Actions requirement)

## Core Workflows

### Development & Testing
```bash
# Install dependencies
npm install

# Test locally with act (requires Docker)
act release -e test-event.json --secret SLACK_RELEASES_WEBHOOK=your-webhook-url

# Edit test-event.json to simulate different release scenarios
```

### Release Process
1. Create a new release on GitHub
2. Action automatically runs via `.github/workflows/release.yml`
3. Sends notification to configured Slack channel

## Project-Specific Patterns

### Input Handling Pattern
The action extracts all data from GitHub event context automatically - no manual inputs needed:
```javascript
const releaseTag = github.context.payload.release?.tag_name || 'unknown';
const actor = github.context.payload.release?.author?.login || github.context.actor;
const actorAvatarUrl = github.context.payload.release?.author?.avatar_url || `https://github.com/${github.context.actor}.png`;
```
This allows zero-configuration usage while supporting optional customization.

### Markdown Conversion
Uses `slackify-markdown` library to convert GitHub-flavored markdown to Slack's mrkdwn format:
- `**bold**` → Slack bold
- `[link](url)` → `<url|link>` format
- Lists, code blocks, etc. are properly converted

### Slack Payload Structure
Uses Slack's **attachments** format (not blocks) for colored bar and author display:
```javascript
{
  text: 'Optional custom title',  // Only if slack-title provided
  attachments: [
    {
      color: '#2cbe4e',  // Green bar on left
      author_name: 'username',
      author_link: 'https://github.com/username',
      author_icon: 'https://avatars.githubusercontent.com/...',
      text: 'Repository link\n\n*Release version is published!*\n\nRelease notes...',
      mrkdwn_in: ['text'],
      footer: 'View Release | Powered by action-release',
      footer_icon: 'https://slack.github.com/static/img/favicon-neutral.png'
    }
  ],
  username: 'Release Bot',  // Optional override
  icon_emoji: ':rocket:',   // Optional override
  channel: '#releases'       // Optional override
}
```

## Key Files Reference

- **index.js**: Single file containing all logic (no build step required)
  - `convertToSlackMarkdown()` - Markdown transformation using `slackify-markdown`
  - `sendSlackMessage()` - Native Node.js HTTPS webhook posting (no external HTTP library)
  - `buildSlackPayload()` - Builds Slack attachment with author avatar, colored bar, and formatted message
  - `run()` - Main entry point with error handling

- **action.yml**: Defines 5 inputs (1 required: `slack-webhook-url`)
  - `slack-webhook-url` (required) - Slack incoming webhook URL
  - `slack-title` (optional) - Custom text above attachment
  - `slack-channel` (optional) - Override webhook's default channel
  - `slack-username` (optional, default: "Release Bot") - Bot display name
  - `slack-icon-emoji` (optional, default: ":rocket:") - Bot emoji icon
  - Uses Node.js 20 runtime
  - Single output: `slack-message` (JSON payload sent to Slack)

- **test-event.json**: Mock release event for local testing
  - Includes `release.author` with avatar URL for realistic testing
  - Edit this to test different release scenarios
  - Used with: `act release -e test-event.json --secret SLACK_RELEASES_WEBHOOK=url`

## Integration Points

### GitHub Context
Automatically extracts from `github.context.payload`:
- `release.tag_name` - Release version
- `release.html_url` - Release page URL  
- `release.body` - Release notes (markdown)
- `release.author.login` - GitHub username
- `release.author.avatar_url` - User's GitHub avatar
- `release.author.html_url` - User's GitHub profile
- `repository.full_name` - Repo owner/name
- `repository.html_url` - Repository URL

### Slack Webhook
- Uses native Node.js `https` module (no external HTTP library)
- POST request with JSON payload
- Expects 200 status for success
- Uses **attachments** format with author display for native Slack appearance

## Conventions & Standards

1. **No build step**: Action runs directly from `index.js` (not TypeScript)
2. **Minimal dependencies**: Only 3 npm packages required
3. **Committed node_modules**: Required for GitHub Actions to work (see `.gitignore`)
4. **GitHub Actions best practices**: Uses `@actions/core` for inputs/outputs/logging
5. **Error handling**: All failures are surfaced via `core.setFailed()`
6. **Versioning**: Use `v1`, `v1.x.x` tags for releases (GitHub Action convention)

## Common Customizations

**Change notification format**: Edit `buildSlackPayload()` function - modify attachment text structure
**Add new inputs**: Update `action.yml` inputs section and read in `run()` function  
**Modify markdown conversion**: Adjust `slackify-markdown` usage or add custom transformations
**Support alternative webhooks**: Extend `sendSlackMessage()` for Teams, Discord, etc.
**Change colors**: Modify `color: '#2cbe4e'` in attachment (green for releases)

## Troubleshooting

- **"Cannot find module" errors**: Ensure `node_modules/` is committed to git
- **Missing release context**: Ensure action runs on `release.published` event
- **Webhook failures**: Check secret name is `SLACK_RELEASES_WEBHOOK`
- **Formatting issues**: Test with `test-event.json` to verify markdown conversion
- **Local testing**: Requires Docker for `act` tool
- **Avatar not showing**: Check `test-event.json` has `release.author.avatar_url`
