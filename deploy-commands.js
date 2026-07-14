require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Postet das Bewerbungs-Dropdown-Menü in diesem Kanal.')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    // Client-ID wird benötigt: aus dem Bot-Token lässt sie sich nicht direkt lesen,
    // daher holen wir sie einmal per API-Aufruf über den Token selbst.
    const app = await rest.get(Routes.oauth2CurrentApplication());
    const CLIENT_ID = app.id;

    console.log('Registriere Slash-Commands...');

    // Guild-Commands: erscheinen SOFORT nur auf diesem einen Server (ideal zum Testen)
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log('Slash-Commands erfolgreich registriert für Server', GUILD_ID);
  } catch (error) {
    console.error(error);
  }
})();
