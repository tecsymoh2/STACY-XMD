# STACY XMD

A multi-number WhatsApp bot built on the official `@whiskeysockets/baileys`, with its own pairing website.
Requires Node 20+.

## Run
1. `cp .env.example .env` and set `PAIR_PASSWORD` (and `DATABASE_URL` if you use Neon)
2. `npm install`
3. `npm start`
4. Open `http://localhost:3000`, enter your number and the password, then enter the code in WhatsApp > Linked devices > Link with phone number.

Each linked number is its own owner: it can use owner commands from its own WhatsApp account, and its `.mode` setting is separate.

## Pairing website
- Served by the bot itself at `/`. Visitors need `PAIR_PASSWORD`.
- Two ways to link: a pairing code typed into WhatsApp, or a QR code scanned from WhatsApp > Linked devices (open the page on a second device to scan it).
- Wrong passwords are rate limited (5 per 10 minutes per IP).
- `MAX_SESSIONS` caps how many numbers can be linked.
- Anyone with the password can link or unlink a number, so share it only with people you trust, and tell them what linking allows.
- Pairing from the logs still works if you set `PAIRING_NUMBER`.

## Storage
Without `DATABASE_URL` logins are saved under `./sessions/<number>` and settings in `./data`.
With `DATABASE_URL` everything is stored in the table `stacy_wa_auth` (created automatically).
Treat the database URL and the stored logins like passwords.

## Hosting
Deploy as a web service (Dockerfile included). Free hosts sleep idle services, so point an uptime pinger at `/health` every 5 minutes.
Run only one copy of the bot per database/prefix, or use a different `AUTH_PREFIX` per copy.

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

Restart and use `.hello`.

## Notes
Baileys is unofficial; WhatsApp can ban numbers. Use spare numbers and avoid spam.
