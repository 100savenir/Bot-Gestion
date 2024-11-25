const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'mods',
    aliases: ['mod', 'moderation'],
    description: "Définit le salon où seront envoyés les messages de log relatifs aux actions de modération."
};

exports.run = async (client, message, args) => {
    const executant = message.author.id;
    const buyer = client.config.clients.buyer;
    const guildId = message.guild.id;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];
    let whitelist = await db.get('whitelist') || [];

    if (!owners.includes(executant) && !buyers.includes(executant) && !whitelist.includes(executant) && executant !== buyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez spécifier 'log' ou 'logs' suivi d'un canal.");
    }

    const addsalon = args[0].toLowerCase();
    if (addsalon !== 'log' && addsalon !== 'logs') {
        return message.channel.send("Commande invalide. Veuillez spécifier 'log' ou 'logs'.");
    }

    const salonid = args[1] ? args[1].replace(/[\\<>@#&!]/g, '') : message.channel.id;

    await db.set(`modLogsChannel_${guildId}`, salonid);
    const channel = message.guild.channels.cache.get(salonid);
    message.channel.send(`Les logs de modération seront désormais envoyés dans ${channel}`);
};
