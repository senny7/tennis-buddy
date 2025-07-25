import 'dotenv/config';
import axios from 'axios';

const DISCORD_APP_ID = process.env.DISCORD_APP_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_APP_ID || !DISCORD_BOT_TOKEN) {
  console.error('Please set DISCORD_APP_ID and DISCORD_BOT_TOKEN in your .env file.');
  process.exit(1);
}

const command = {
  name: 'available',
  description: 'Check for available tennis courts at Sud Arena.',
  type: 1, // CHAT_INPUT
};

// URL for installing commands globally
const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`;

const headers = {
  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
  'Content-Type': 'application/json',
};

async function registerCommand() {
  try {
    console.log('Registering "/available" command...');
    const response = await axios.post(url, command, { headers });
    console.log('Command registered successfully!');
    console.log(response.data);
  } catch (error) {
    console.error('Failed to register command:');
    console.error(error.response ? error.response.data : error.message);
  }
}

registerCommand();