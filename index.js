const core = require('@actions/core');
const github = require('@actions/github');
const slackifyMarkdown = require('./lib/slackify');

/**
 * Convert GitHub markdown to Slack mrkdwn format
 * @param {string} text - The markdown text to convert
 * @returns {string} - Slack-formatted text
 */
function convertToSlackMarkdown(text) {
  if (!text) return '';
  return slackifyMarkdown(text);
}

/**
 * Send a message to Slack via webhook
 * @param {string} webhookUrl - Slack webhook URL
 * @param {object} payload - Message payload
 */
async function sendSlackMessage(webhookUrl, payload) {
  const https = require('https');
  const url = require('url');

  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(webhookUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Slack API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Build the Slack message payload
 */
function buildSlackPayload(inputs) {
  const { releaseTag, releaseUrl, releaseBody, repositoryName, repositoryUrl, slackTitle, slackChannel, slackUsername, slackIconEmoji, actor, actorUrl, actorAvatarUrl } = inputs;

  // Convert markdown to Slack format
  const formattedBody = convertToSlackMarkdown(releaseBody || 'No release notes provided.');

  // Build message text
  const repoLink = `<${repositoryUrl}|${repositoryName}>`;
  const releaseLink = `<${releaseUrl}|${releaseTag}>`;

  const text = `\n${repoLink}\n\n*Release ${releaseLink} is published!*\n\n${formattedBody}`;

  // Build payload with attachments (for colored bar and author avatar)
  const payload = {
    attachments: [
      {
        color: '#2cbe4e',
        author_name: actor,
        author_link: actorUrl,
        author_icon: actorAvatarUrl,
        text: text,
        mrkdwn_in: ['text'],
        footer: `<${releaseUrl}|View Release> | Powered by <https://github.com/titenkov/action-release|action-release>`,
        footer_icon: 'https://slack.github.com/static/img/favicon-neutral.png',
      },
    ],
  };

  // Add optional text above attachment if provided
  if (slackTitle) {
    payload.text = slackTitle;
  }

  // Add optional overrides
  if (slackUsername) {
    payload.username = slackUsername;
  }
  if (slackIconEmoji) {
    payload.icon_emoji = slackIconEmoji;
  }
  if (slackChannel) {
    payload.channel = slackChannel;
  }

  return payload;
}

/**
 * Main action entry point
 */
async function run() {
  try {
    // Get inputs
    const webhookUrl = core.getInput('slack-webhook-url', { required: true });
    const releaseTag = github.context.payload.release?.tag_name || 'unknown';
    const releaseUrl = github.context.payload.release?.html_url || '';
    const releaseBody = github.context.payload.release?.body || '';
    const repositoryName = github.context.payload.repository?.full_name || github.context.repo.owner + '/' + github.context.repo.repo;
    const repositoryUrl = github.context.payload.repository?.html_url || `https://github.com/${repositoryName}`;
    const actor = github.context.payload.release?.author?.login || github.context.actor;
    const actorUrl = github.context.payload.release?.author?.html_url || `https://github.com/${github.context.actor}`;
    const actorAvatarUrl = github.context.payload.release?.author?.avatar_url || `https://github.com/${github.context.actor}.png`;
    const slackTitle = core.getInput('slack-title');
    const slackChannel = core.getInput('slack-channel');
    const slackUsername = core.getInput('slack-username');
    const slackIconEmoji = core.getInput('slack-icon-emoji');

    core.info(`Preparing Slack notification for release: ${releaseTag}`);

    // Build and send message
    const payload = buildSlackPayload({
      releaseTag,
      releaseUrl,
      releaseBody,
      repositoryName,
      repositoryUrl,
      slackTitle,
      slackChannel,
      slackUsername,
      slackIconEmoji,
      actor,
      actorUrl,
      actorAvatarUrl,
    });

    core.info('Sending message to Slack...');
    await sendSlackMessage(webhookUrl, payload);

    core.info('✅ Slack notification sent successfully!');
    core.setOutput('slack-message', JSON.stringify(payload));
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
