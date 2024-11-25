const { PermissionsBitField, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'hideall',
    description: "Cache tous les salons du serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];

    if (!owners.includes(userId) && userId !== buyer) {
        return;
    }

    const everyoneRole = message.guild.roles.everyone;

    try {
        // Parcourir tous les salons du serveur
        message.guild.channels.cache.forEach(async (channel) => {
            if ([ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type)) {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    [PermissionsBitField.Flags.ViewChannel]: false
                });
            }
        });

        return message.channel.send("Tous les salons ont été cachés.");
    } catch (error) {
        console.error("Erreur lors de la modification des permissions:", error);
        return message.channel.send("Une erreur s'est produite lors de la tentative de cacher tous les salons.");
    }
};
