# STACY XMD

A WhatsApp bot built on the official `@whiskeysockets/baileys`.

## Run
1. `cp .env.example .env` and fill in `PAIRING_NUMBER` and `OWNER_NUMBER`
2. `npm install`
3. `npm start`
4. Enter the printed pairing code in WhatsApp > Linked Devices > Link with phone number

Login is saved in `./session`, settings in `./data` (or in Neon Postgres if configured, see below). Keep them private.
Requires Node 20+.
Video stickers need `ffmpeg` installed (the Dockerfile includes it).

## Commands
- General: menu, ping, alive, owner
- AI: ai, chatbot on|off|reset (owner)
- Media: sticker, toimg
- Group (admin, bot must be admin for most): tagall, hidetag, kick, add, promote, demote, groupinfo, link, mute, unmute, antilink
- Fun: joke, fact, flip, dice
- Tools: weather, calc
- Owner: mode public|self, broadcast

## Add a command
Create `commands/hello.js`:

    module.exports = {
      name: "hello",
      category: "fun",
      desc: "Say hi",
      // optional flags: ownerOnly, groupOnly, adminOnly, botAdmin
      async run({ sock, m, jid, reply }) {
        reply("Hi!");
      },
    };

Restart the bot and use `.hello`.

## Notes
Baileys is unofficial; WhatsApp can ban numbers. Use a spare number and avoid spam.

## Hosting without a disk (Neon)
1. Create a Neon project and copy its connection string (Neon dashboard > Connect, use the pooled one).
2. Set it as `DATABASE_URL`. The bot creates the table `stacy_wa_auth` by itself and stores the WhatsApp login and settings there.
3. Deploy as a web service. The bot listens on `PORT` and answers `GET /` with a short status text.
4. Free hosts sleep idle services; point an uptime pinger at your service URL every 5 minutes to keep it awake.
5. Run only one copy of the bot per login at a time (use a different `AUTH_PREFIX` for each copy).
6. Treat `DATABASE_URL` like a password and never commit it.
