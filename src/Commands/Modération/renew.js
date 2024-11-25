const { PermissionsBitField, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'renew',
    aliases: ['reset'],
    description: 'Duplique un salon mentionné ou celui où la commande est exécutée, supprime le salon original et place le nouveau salon au même endroit avec les mêmes paramètres.'
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';
    const buyersKey = 'buyers';

    const owners = await db.get(ownersKey) || [];
    const buyers = await db.get(buyersKey) || [];

    if (userId !== buyerId && !owners.includes(userId) && !buyers.includes(userId)) {
        if (message.channel) {
            return;
        }
        return;
    }

    const channelMention = message.mentions.channels.first();
    const targetChannelId = args[0] && !isNaN(args[0]) ? args[0] : channelMention ? channelMention.id : message.channel.id;
    const targetChannel = message.guild.channels.cache.get(targetChannelId);

    if (!targetChannel) {
        if (message.channel) {
            return message.channel.send("Le salon mentionné n'existe pas ou l'ID fourni est invalide.");
        }
        return;
    }

    try {
        const channelData = {
            name: targetChannel.name,
            type: targetChannel.type,
            topic: targetChannel.topic,
            nsfw: targetChannel.nsfw,
            rateLimitPerUser: targetChannel.rateLimitPerUser,
            parentId: targetChannel.parentId,
            position: targetChannel.position,
            permissions: targetChannel.permissionOverwrites.cache.map(perm => ({
                id: perm.id,
                allow: perm.allow.toArray(),
                deny: perm.deny.toArray()
            }))
        };

        const newChannel = await message.guild.channels.create({
            name: channelData.name,
            type: channelData.type,
            topic: channelData.topic,
            nsfw: channelData.nsfw,
            rateLimitPerUser: channelData.rateLimitPerUser,
            parentId: channelData.parentId,
            reason: 'Salon dupliqué et remplacé avec la commande !renew'
        });

        for (const perm of channelData.permissions) {
            await newChannel.permissionOverwrites.create(perm.id, {
                ...Object.fromEntries(perm.allow.map(perm => [perm, true])),
                ...Object.fromEntries(perm.deny.map(perm => [perm, false]))
            }, { reason: 'Permissions copiées avec la commande !renew' });
        }

        await targetChannel.delete();

        const parentChannel = message.guild.channels.cache.get(channelData.parentId);
        const newChannelPosition = channelData.position;

        await newChannel.setParent(parentChannel, { lockPermissions: false });
        await newChannel.setPosition(newChannelPosition, { reason: 'Repositionnement du salon à la place de l\'ancien salon.' });

        const confirmationMessage = await newChannel.send(`Salon renew par ${message.author}.`);

        setTimeout(() => confirmationMessage.delete(), 3000);

        if (message.channel) {
            await message.channel.send(`Le salon ${targetChannel.name} a été dupliqué, l'original a été supprimé, et le nouveau salon est maintenant au même endroit.`);
        }
    } catch (error) {
        console.error(error);
        if (message.channel) {
            await message.channel.send("Une erreur s'est produite lors de la duplication et de la suppression du salon.");
        }
    }
};
