const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'boosts',
    aliases: ['boost'],
    description: "Définit le salon où seront envoyés les messages de log relatifs aux boosts du serveur."
};

exports.run = async (client, message, args) => {
    const executant = message.author.id;
    const buyer = client.config.clients.buyer;
    const guildId = message.guild.id;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];

    if (!owners.includes(executant) && !buyers.includes(executant) && executant !== buyer) {
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

    await db.set(`boostLogsChannel_${guildId}`, salonid);
    const channel = message.guild.channels.cache.get(salonid);
    message.channel.send(`Les logs de boost seront désormais envoyés dans ${channel}`);
};
