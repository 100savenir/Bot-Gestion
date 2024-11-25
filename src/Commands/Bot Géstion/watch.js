const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { ActivityType } = require('discord.js');

exports.help = {
    name: 'watch',
    description: "Change l'activité du bot en mode Watch.",
    aliases: ['lookup']
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
        return message.channel.send("Veuillez saisir le nom de l'activité Watch.");
    }

    const watchName = args.join(" ");

    try {
        await client.user.setActivity(watchName, { type: ActivityType.Watching });
        await db.set('activity', { type: 'Watching', name: watchName });
        message.channel.send(`Je regarde maintenant: \`${watchName}\``);
    } catch (error) {
        console.error('Erreur lors du changement d\'activité:', error);
        message.channel.send("Je n'ai pas pu changer mon activité. Veuillez réessayer.");
    }
};
