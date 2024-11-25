const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { ActivityType } = require('discord.js');

exports.help = {
    name: 'stream',
    description: "Change l'activité du bot en mode Stream."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const streamUrl = "https://twitch.tv/bycentavenir";

    const isBuyer = userId === buyerId;
    const owners = await db.get('owners') || [];
    const buyers = await db.get('buyers') || [];
    const isOwner = owners.includes(userId);
    const isRegisteredBuyer = buyers.includes(userId);

    if (!isBuyer && !isOwner && !isRegisteredBuyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez saisir le nom du stream.");
    }

    const streamName = args.join(" ");

    try {
        await client.user.setActivity(streamName, { type: ActivityType.Streaming, url: streamUrl });
        await db.set('activity', { type: 'Streaming', name: streamName, url: streamUrl });
        message.channel.send(`Je stream maintenant: \`${streamName}\``);
    } catch (error) {
        console.error('Erreur lors du changement d\'activité:', error);
        message.channel.send("Je n'ai pas pu changer mon activité. Veuillez réessayer.");
    }
};
