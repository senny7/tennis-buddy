import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, verifyKeyMiddleware } from 'discord-interactions';
import { getAvailableCourts } from './scraper.js';
import { sendFollowupMessage } from './discord.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to verify requests from Discord
app.use('/interactions', verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY));

app.post('/interactions', async (req, res) => {
  const { type, id, data, token } = req.body;

  /**
   * Handle PING from Discord
   */
  if (type === InteractionType.PING) {
    console.log('Received PING from Discord.');
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'available') {
      console.log('Received "/available" command.');

      // Acknowledge the command immediately to prevent timeout
      res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      // Now do the heavy lifting (scraping)
      try {
        const courts = await getAvailableCourts();
        const content = formatCourtMessage(courts);
        await sendFollowupMessage(token, content);
        console.log('Successfully sent court availability to Discord.');
      } catch (error) {
        console.error('Error processing command:', error);
        const errorMessage = "⚠️ **Error**: Unable to check court availability. The website might be down or has changed. Please try again later.";
        await sendFollowupMessage(token, errorMessage);
      }
    }
  }
});

/**
 * Formats the court data into a Discord-friendly message.
 * @param {Array<object>} courts - An array of court objects from the scraper.
 * @returns {string} A formatted string for the Discord message.
 */
function formatCourtMessage(courts) {
  const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Bucharest' });

  if (!courts || courts.length === 0) {
    return `🎾 **Tennis Courts Status**\n\n😔 No available courts found with 'Liber' status.\n\n⏰ Checked: ${timestamp} (Romania time)\n\nTry again later!`;
  }

  let content = `🎾 **Available Tennis Courts at Sud Arena**\n\n`;
  courts.forEach((court, index) => {
    content += `${index + 1}. **${court.courtName}** at **${court.timeSlot}**\n`;
  });

  content += `\n📊 **Total Available**: ${courts.length} slots\n`;
  content += `⏰ **Last Checked**: ${timestamp} (Romania time)\n\n`;
  content += "Visit https://www.sudarena.ro/rezervari to book!";

  return content;
}

app.listen(PORT, () => {
  console.log(`Tennis Buddy is listening on port ${PORT}`);
});