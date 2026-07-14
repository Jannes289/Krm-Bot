# KRM Bewerbungs-Bot

Discord-Bot mit einem Dropdown-Menü im Kanal **Bewerbungen**. Zur Auswahl stehen:

- 🎥 Twitch-Streamer
- 🛡️ Discord-Mod
- ⚔️ Clan-Bewerbung (die Zuteilung zu KRM Clan 1 oder 2 erfolgt manuell durch das Team)

Bei Auswahl wird automatisch ein privates Ticket-Kanal erstellt, in dem der Bewerber die passenden Fragen beantworten kann. Über den Button "Ticket schließen" kann das Ticket wieder gelöscht werden.

## 1. Bot im Discord Developer Portal anlegen

1. Gehe zu https://discord.com/developers/applications
2. "New Application" -> Namen vergeben (z. B. "KRM Bewerbungen")
3. Links auf "Bot" -> "Add Bot"
4. Unter "Privileged Gateway Intents" aktivieren:
   - Server Members Intent
5. Bei "Token" auf "Reset Token" / "Copy" klicken -> das ist dein `DISCORD_TOKEN`

## 2. Bot auf den Server einladen

1. Links auf "OAuth2" -> "URL Generator"
2. Scopes: `bot`
3. Bot Permissions: `Manage Channels`, `Send Messages`, `View Channels`, `Read Message History`, `Manage Roles` (falls du Rollen automatisch vergeben willst)
4. Die generierte URL öffnen und den Bot auf deinen Server einladen

## 3. Server-Infos sammeln (Entwicklermodus aktivieren)

In Discord: Einstellungen -> Erweitert -> Entwicklermodus aktivieren. Dann per Rechtsklick die IDs kopieren:

- Server-ID -> `GUILD_ID`
- Kanal "Bewerbungen" -> `BEWERBUNGEN_CHANNEL_ID`
- (Optional) Kategorie, in der Tickets erstellt werden sollen -> `TICKET_CATEGORY_ID`
- Mod-/Team-Rolle -> `MOD_ROLLE_ID`

## 4. Konfiguration

1. Datei `.env.example` zu `.env` umbenennen
2. Alle Werte eintragen, z. B.:

```
DISCORD_TOKEN=dein-bot-token
GUILD_ID=123456789012345678
BEWERBUNGEN_CHANNEL_ID=123456789012345678
TICKET_CATEGORY_ID=123456789012345678
MOD_ROLLE_ID=123456789012345678
```

## 5. Installation & Slash-Command registrieren

```bash
npm install
npm run deploy-commands
```

Das registriert einmalig den Befehl **`/ticket-setup`** auf deinem Server (erscheint dank Guild-Command meist sofort, spätestens nach ein paar Minuten in der Befehlsliste).

## 6. Bot starten

```bash
npm start
```

Der Bot postet **nicht mehr automatisch** beim Start. Stattdessen: Gehe in den gewünschten Kanal (z. B. "Bewerbungen") und tippe:

```
/ticket-setup
```

Das postet das Dropdown-Menü in genau diesem Kanal. Der Befehl kann jederzeit erneut ausgeführt werden, falls du das Menü woanders oder erneut posten willst.

## Anpassungen

Alle Fragen und Bezeichnungen der Bewerbungsarten lassen sich im `index.js` im Objekt `BEWERBUNGSARTEN` ändern (Fragen hinzufügen/entfernen, Label ändern usw.).
