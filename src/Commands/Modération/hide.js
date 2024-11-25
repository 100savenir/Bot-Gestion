const { PermissionsBitField, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'hide',
    description: "Cache un salon."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];
    let whitelist = await db.get('whitelist') || [];

    if (!owners.includes(userId) && userId !== buyer && !whitelist.includes(userId)) {
        return;
    }

    let targetChannel = message.channel;

    if (args[0]) {
        const channelId = args[0].replace(/[<#>]/g, ''); // Extraire l'ID si une mention est fournie
        targetChannel = message.guild.channels.cache.get(channelId);
        
        if (!targetChannel) {
            return message.channel.send("Salon spécifié introuvable. Veuillez vérifier l'ID ou la mention du salon.");
        }
    }

    const everyoneRole = message.guild.roles.everyone;

    try {
        if ([ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(targetChannel.type)) {
            await targetChannel.permissionOverwrites.edit(everyoneRole, {
                [PermissionsBitField.Flags.ViewChannel]: false
            });

            return message.channel.send(`Le salon ${targetChannel} a été caché.`);
        } else {
            return message.channel.send("Le type de salon spécifié ne peut pas être caché avec cette commande.");
        }
    } catch (error) {
        console.error("Erreur lors de la modification des permissions:", error);
        return message.channel.send("Une erreur s'est produite lors de la tentative de cacher le salon.");
    }
};
