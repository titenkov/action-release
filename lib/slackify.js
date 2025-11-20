/**
 * Simple markdown to Slack mrkdwn converter using Regex.
 * Zero dependencies.
 */
module.exports = (markdown) => {
  if (!markdown) return '';

  const zeroWidthSpace = String.fromCharCode(0x200B);

  let text = markdown;

  const codeBlocks = [];
  const inlineCodes = [];

  // 1. Hide Code Blocks
  text = text.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (match, content) => {
    codeBlocks.push(content);
    return `:::CODEBLOCK${codeBlocks.length - 1}:::`;
  });

  // 2. Hide Inline Code
  text = text.replace(/`([^`]+)`/g, (match, content) => {
    inlineCodes.push(content);
    return `:::INLINECODE${inlineCodes.length - 1}:::`;
  });

  // 3. Links: [text](url) -> <url|text>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>');

  // 4. Headers: # Text -> *Text* (No ZWS for headers)
  text = text.replace(/^#+\s+(.*)$/gm, ':::HEADEROPEN:::$1:::HEADERCLOSE:::');

  // 5. Lists: * Item or - Item -> • Item
  text = text.replace(/^\s*[\*\-]\s+(.*)$/gm, '• $1');

  // 6. Bold: **text** -> \u200B*text*\u200B
  text = text.replace(/\*\*(.*?)\*\*/g, ':::BOLDOPEN:::$1:::BOLDCLOSE:::');

  // 7. Strike: ~~text~~ -> \u200B~text~\u200B
  text = text.replace(/~~(.*?)~~/g, ':::STRIKEOPEN:::$1:::STRIKECLOSE:::');

  // 8. Italic: _text_ -> \u200B_text_\u200B
  text = text.replace(/_(.*?)_/g, ':::ITALICOPEN:::$1:::ITALICCLOSE:::');

  // 9. Italic: *text* -> \u200B_text_\u200B
  text = text.replace(/\*(.*?)\*/g, ':::ITALICOPEN:::$1:::ITALICCLOSE:::');

  // Restore placeholders
  text = text.split(':::HEADEROPEN:::').join('*');
  text = text.split(':::HEADERCLOSE:::').join('*');

  text = text.split(':::BOLDOPEN:::').join(`${zeroWidthSpace}*`);
  text = text.split(':::BOLDCLOSE:::').join(`*${zeroWidthSpace}`);

  text = text.split(':::STRIKEOPEN:::').join(`${zeroWidthSpace}~`);
  text = text.split(':::STRIKECLOSE:::').join(`~${zeroWidthSpace}`);

  text = text.split(':::ITALICOPEN:::').join(`${zeroWidthSpace}_`);
  text = text.split(':::ITALICCLOSE:::').join(`_${zeroWidthSpace}`);

  // Restore Code Blocks
  text = text.replace(/:::CODEBLOCK(\d+):::/g, (match, index) => {
    return `\`\`\`\n${codeBlocks[parseInt(index)]}\`\`\``;
  });

  // Restore Inline Code
  text = text.replace(/:::INLINECODE(\d+):::/g, (match, index) => {
    return `\`${inlineCodes[parseInt(index)]}\``;
  });

  return text;
};
