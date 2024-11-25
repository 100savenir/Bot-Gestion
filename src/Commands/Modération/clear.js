const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'clear',
    aliases: ['supr'],
    description: 'Supprime des messages en fonction des critères spécifiés.'
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';
    const buyersKey = 'buyers';
    const whitelistKey = 'whitelist';

    // Récupération des listes d'IDs depuis la DB
    const owners = await db.get(ownersKey) || [];
    const buyers = await db.get(buyersKey) || [];
    const whitelist = await db.get(whitelistKey) || [];

    // Vérification des permissions
    if (userId !== buyerId && !owners.includes(userId) && !buyers.includes(userId) && !whitelist.includes(userId)) {
        return;
    }

    const amount = parseInt(args[0], 10);
    const userMention = message.mentions.users.first();
    const channelMention = message.mentions.channels.first();
    const targetChannel = channelMention || message.channel;

    try {
        if (amount && !isNaN(amount) && amount > 0 && amount <= 99) {
            const fetchedMessages = await targetChannel.messages.fetch({ limit: amount });
            await targetChannel.bulkDelete(fetchedMessages, true);
            return message.channel.send(`Supprimé ${fetchedMessages.size} messages.`);
        }

        if (userMention) {
            const fetchedMessages = await targetChannel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(msg => msg.author.id === userMention.id && (Date.now() - msg.createdTimestamp) < 1209600000); // Messages de moins de 14 jours
            await targetChannel.bulkDelete(userMessages, true);
            return message.channel.send(`Supprimé \`${userMessages.size}\` messages de \`${userMention.username}\`.`);
        }

        if (args[1] && channelMention) {
            const mentionedChannel = channelMention;

            const fetchedMessages = await mentionedChannel.messages.fetch({ limit: 100 });
            const recentMessages = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 1209600000); 
            await mentionedChannel.bulkDelete(recentMessages, true);
            return message.channel.send(`Supprimé \`${recentMessages.size}\` messages récents dans le salon ${mentionedChannel}.`);
        }

        const fetchedMessages = await targetChannel.messages.fetch({ limit: 100 });
        const recentMessages = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 1209600000);
        await targetChannel.bulkDelete(recentMessages, true);
        return message.channel.send(`Supprimé \`${recentMessages.size}\` messages récents dans le salon ${targetChannel}.`);
    } catch (error) {
        console.error(error);
        return message.channel.send("Une erreur s'est produite lors de la suppression des messages.");
    }
};
