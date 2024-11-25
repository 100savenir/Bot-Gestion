const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { ActivityType } = require('discord.js');

exports.help = {
    name: 'listen',
    description: "Change l'activité du bot en mode Listen.",
    aliases: ['listening', 'ecoute', 'ecouter', 'écoute', 'écouter']
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;

    const isBuyer = userId === buyerId;
    const owners = await db.get('owners') || [];
    const buyers = await db.get('buyers') || [];
    const isOwner = owners.includes(userId);
    const isRegisteredBuyer = buyers.includes(userId);

    if (!isBuyer && !isOwner && !isRegisteredBuyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez saisir le nom de l'activité Listen.");
    }

    const listenName = args.join(" ");

    try {
        await client.user.setActivity(listenName, { type: ActivityType.Listening });
        await db.set('activity', { type: 'Listening', name: listenName });
        message.channel.send(`J'écoute maintenant: \`${listenName}\``);
    } catch (error) {
        console.error('Erreur lors du changement d\'activité:', error);
        message.channel.send("Je n'ai pas pu changer mon activité. Veuillez réessayer.");
    }
};
