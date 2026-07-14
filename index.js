require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const BEWERBUNGEN_CHANNEL_ID = process.env.BEWERBUNGEN_CHANNEL_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID || null;
const MOD_ROLLE_ID = process.env.MOD_ROLLE_ID;

// ---------------------------------------------------------------------
// Konfiguration der Bewerbungsarten: hier lassen sich Fragen anpassen
// ---------------------------------------------------------------------
const BEWERBUNGSARTEN = {
  twitch: {
    label: 'Twitch-Streamer',
    emoji: '🎥',
    kanalPraefix: 'twitch',
    fragen: [
      'Dein Ingame-Name:',
      'Dein Twitch-Link:',
      'Wie viele Follower hast du aktuell?',
      'Wann/wie oft möchtest du streamen?',
    ],
  },
  mod: {
    label: 'Discord-Mod',
    emoji: '🛡️',
    kanalPraefix: 'mod',
    fragen: [
      'Dein Ingame-Name:',
      'Dein Alter:',
      'Erfahrung als Mod/Teamler:',
      'Wie viel Zeit kannst du wöchentlich investieren?',
    ],
  },
  clan: {
    label: 'Clan-Bewerbung',
    emoji: '⚔️',
    kanalPraefix: 'clan',
    fragen: [
      'Dein Ingame-Name:',
      'Deine bisherige Erfahrung:',
      'Warum möchtest du bei uns im Clan mitmachen?',
    ],
    hinweis: 'Die Zuteilung zu KRM Clan 1 oder Clan 2 erfolgt manuell durch das Team.',
  },
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`Eingeloggt als ${client.user.tag}`);
});

// Postet das Dropdown-Menü in einen bestimmten Kanal (Standard: Bewerbungs-Kanal aus .env)
async function postDropdown(channelId = BEWERBUNGEN_CHANNEL_ID) {
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    console.error('Kanal nicht gefunden. Bitte Kanal-ID prüfen.');
    return false;
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Bewerbungen')
    .setDescription('Wähle unten aus, wofür du dich bewerben möchtest. Es wird automatisch ein privates Ticket für dich erstellt.')
    .setColor(0x5865f2);

  const select = new StringSelectMenuBuilder()
    .setCustomId('bewerbung_select')
    .setPlaceholder('Bewerbung auswählen')
    .addOptions(
      Object.entries(BEWERBUNGSARTEN).map(([key, val]) => ({
        label: val.label,
        value: key,
        emoji: val.emoji,
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);

  await channel.send({ embeds: [embed], components: [row] });
  console.log('Dropdown-Menü gepostet.');
  return true;
}

client.on('interactionCreate', async (interaction) => {
  try {
    // Slash-Command: /ticket-setup -> postet das Dropdown-Menü in diesen Kanal
    if (interaction.isChatInputCommand() && interaction.commandName === 'ticket-setup') {
      await interaction.deferReply({ ephemeral: true });
      const erfolg = await postDropdown(interaction.channelId);
      await interaction.editReply(
        erfolg
          ? 'Das Bewerbungs-Menü wurde in diesem Kanal gepostet.'
          : 'Fehler: Kanal konnte nicht gefunden werden.'
      );
      return;
    }

    // Dropdown-Auswahl -> Ticket erstellen
    if (interaction.isStringSelectMenu() && interaction.customId === 'bewerbung_select') {
      const auswahl = interaction.values[0];
      const config = BEWERBUNGSARTEN[auswahl];
      if (!config) return;

      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      const user = interaction.user;

      const kanalName = `${config.kanalPraefix}-${user.username}`.toLowerCase().slice(0, 90);

      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ];

      if (MOD_ROLLE_ID) {
        permissionOverwrites.push({
          id: MOD_ROLLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        });
      }

      const ticketKanal = await guild.channels.create({
        name: kanalName,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID || undefined,
        permissionOverwrites,
      });

      const fragenText = config.fragen.map((f, i) => `**${i + 1}.** ${f}`).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${config.emoji} Bewerbung: ${config.label}`)
        .setDescription(
          `Hallo <@${user.id}>, danke für deine Bewerbung als **${config.label}**!\n\nBitte beantworte hier folgende Fragen:\n\n${fragenText}` +
            (config.hinweis ? `\n\n*${config.hinweis}*` : '')
        )
        .setColor(0x57f287);

      const closeButton = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Ticket schließen')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');

      const row = new ActionRowBuilder().addComponents(closeButton);

      await ticketKanal.send({
        content: MOD_ROLLE_ID ? `<@&${MOD_ROLLE_ID}>` : undefined,
        embeds: [embed],
        components: [row],
      });

      await interaction.editReply({
        content: `Dein Ticket wurde erstellt: ${ticketKanal}`,
      });
    }

    // Ticket schließen
    if (interaction.isButton() && interaction.customId === 'ticket_close') {
      await interaction.reply('🔒 Dieses Ticket wird in 5 Sekunden geschlossen...');
      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    }
  } catch (err) {
    console.error(err);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({ content: 'Es ist ein Fehler aufgetreten.', ephemeral: true }).catch(() => {});
    }
  }
});

client.login(TOKEN);
