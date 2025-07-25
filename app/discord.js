import 'dotenv/config';
import axios from 'axios';

const DISCORD_APP_ID = process.env.DISCORD_APP_ID;

/**
 * Sends a follow-up message to a Discord interaction.
 * @param {string} token - The interaction token from the incoming request.
 * @param {string} content - The message content to send.
 */
export async function sendFollowupMessage(token, content) {
  const url = `https://discord.com/api/v10/webhooks/${DISCORD_APP_ID}/${token}/messages/@original`;

  // Ensure content is not too long for Discord
  const body = {
    content: content.substring(0, 2000),
  };

  // We use a PATCH request to edit the original "thinking..." message.
  await axios.patch(url, body);
}