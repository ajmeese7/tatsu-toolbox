const Discord = require("discord.js");
const config = require("./config.json");
const colors = require("colors");
const Tatsu = "172002275412279296";

process.on('unhandledRejection', error => {
  console.error("Error trying to login with credentials! Did you update the config.json file?");
  process.exit();
});

const client = new Discord.Client();
client.config = config;
client.on('ready', async () => {
  console.log("Ready to level up!");
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const trashItems = ["🔋", "🔧", "👞", "📎", "🛒"];
const rareItems = ["🐙", "🐢", "🐳", "🐋", "🐊", "🐧", "🦈", "🦑", "🦐", "🐬", "🦀", "🐡"];
let trashItemCount = 0,
    commonItemCount = 0,
    uncommonItemCount = 0,
    rareItemCount = 0;
let count = 1;

client.on("message", async message => {
  if (message.author.id === Tatsu) {
    // If it isn't a fishing message, we don't care.
    if (!message.content.includes("You paid 💴 **10** for casting.")) return;

    for (let i = 0; i < trashItems.length; i++)
      if (message.content.includes(trashItems[i]))
        return trashItemCount++;
    if (message.content.includes("🐟"))
      return commonItemCount++;
    if (message.content.includes("🐠"))
      return uncommonItemCount++;
    for (let i = 0; i < rareItems.length; i++)
      // TODO: Do we need this, or can I just check the fish inventory after?
      if (message.content.includes(rareItems[i]))
        return rareItemCount++;
  }
  
  // Ignore message if the content doesn't apply to us
  if (message.author.id !== client.user.id || message.content.indexOf(client.config.prefix) !== 0) return;

  const prefix = config.prefix;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "start") {
    message.channel.send("t!daily");
    await sleep(5250);

    // IDEA: Pull a random user from the server if one isn't specified
    let user = message.mentions.users.first();
    if (user) message.channel.send(`t!rep <@${user.id}>`);
  } else if (command === "fish") {
    let maxMessages = args.length > 0 ? args[0] : 100;
    async function goFishing() {
      message.channel.send("t!fishy");

      if (count < maxMessages) {
        count++;

        // Go fishing every 31 seconds
        setTimeout(goFishing, 31000);
      } else {
        count = 1;

        // NOTE: Can add check if the relevant category is empty, for small fishing sets
        await sleep(5250);
        message.channel.send("t!fishy sell garbage");
        await sleep(5250);
        message.channel.send("t!fishy sell common");
        await sleep(5250);
        message.channel.send("t!fishy sell uncommon");
        await sleep(5250);
        // TODO: Rares

        // Pings the user so the message stands out to them
        let totalSold = trashItemCount + commonItemCount + uncommonItemCount + rareItemCount;
        let totalCost = trashItemCount * 6 + commonItemCount * 12 + uncommonItemCount * 20 + rareItemCount * 1250;
        message.channel.send(`<@${client.user.id}>, you sold **${totalSold}** items for a total of 💴 **${totalCost}**!`);
        console.log("You sold " + `${totalSold}`.green + " items for a total of ¥" + `${totalCost}`.green + "!");
      }
    }

    await goFishing();
  }
});

client.login(config.botToken);