# Contributing to action-release

Thank you for your interest in contributing to action-release!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/titenkov/action-release.git
   cd action-release
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Make your changes**
   - Edit `index.js` for logic changes
   - Update `action.yml` for new inputs/outputs
   - Update `README.md` for documentation

## Testing

### Local Testing with act
The best way to test the action locally is using [act](https://github.com/nektos/act):

```bash
# Install act (macOS)
brew install act

# Test with a mock release event
act release -e test-event.json --secret SLACK_WEBHOOK_URL=your-webhook-url
```

### Modify Test Event
Edit `test.json` to test different scenarios:
- Change `tag_name` to test version formatting
- Modify `body` to test markdown conversion
- Update `html_url` to verify link formatting

### Manual Testing
You can also test by:
1. Creating a test release in your fork
2. Observing the workflow run in Actions tab
3. Checking the Slack notification

## Code Style

- Use clear, descriptive variable names
- Add JSDoc comments for functions
- Follow Node.js conventions
- Keep `index.js` as a single file (no build step)

## Questions?

Open an issue for discussion before making major changes.
