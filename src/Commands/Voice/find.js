const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'find',
    aliases: [],
    description: "Permet de savoir si un utilisateur est en vocal."
};

exports.run = async (client, message, args) => {
    const executant = message.author.id;
    const buyer = client.config.clients.buyer;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];
    let whitelist = await db.get('whitelist') || [];

    if (!owners.includes(executant) && !buyers.includes(executant) && !whitelist.includes(executant) && executant !== buyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez saisir une ID ou une mention.");
    }

    const idmec = args[0].replace(/[\\<>@!]/g, '');
    const mec = message.guild.members.cache.get(idmec);

    if (!mec) {
        return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
    }

    const EnVoc = mec.voice.channel;

    if (EnVoc) {
        const embed = new EmbedBuilder()
            .setDescription(`${mec} est en vocal dans ${EnVoc}`)
            .setColor(client.config.clients.embedColor);
        return message.channel.send({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setDescription(`${mec} n'est pas en vocal`)
            .setColor(client.config.clients.embedColor);
        return message.channel.send({ embeds: [embed] });
    }
};
