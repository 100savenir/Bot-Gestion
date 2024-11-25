const { PermissionsBitField, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'unhideall',
    description: "Affiche tous les salons du serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners et la whitelist depuis la base de données
    let owners = await db.get('owners') || [];
    let whitelist = await db.get('whitelist') || [];

    if (!owners.includes(userId) && userId !== buyer && !whitelist.includes(userId)) {
        return;
    }

    const everyoneRole = message.guild.roles.everyone;

    try {
        // Parcourir tous les salons du serveur
        message.guild.channels.cache.forEach(async (channel) => {
            if ([ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type)) {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    [PermissionsBitField.Flags.ViewChannel]: true
                });
            }
        });

        return message.channel.send("Tous les salons ont été affichés.");
    } catch (error) {
        console.error("Erreur lors de la modification des permissions:", error);
        return message.channel.send("Une erreur s'est produite lors de la tentative d'afficher tous les salons.");
    }
};
