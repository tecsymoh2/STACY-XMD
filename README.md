# STACY XMD

A WhatsApp bot built on the official `@whiskeysockets/baileys`.

## Run
1. `cp .env.example .env` and fill in `PAIRING_NUMBER` and `OWNER_NUMBER`
2. `npm install`
3. `npm start`
4. Enter the printed pairing code in WhatsApp > Linked Devices > Link with phone number

Login is saved in `./session`, settings in `./data`. Keep both private and on persistent storage when deploying.
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
