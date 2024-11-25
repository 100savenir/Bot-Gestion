const { PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'lock',
    description: "lock un salon."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];

    if (!owners.includes(userId) && userId !== buyer) {
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
        await targetChannel.permissionOverwrites.edit(everyoneRole, {
            [PermissionsBitField.Flags.SendMessages]: false
        });

        return message.channel.send(`Les membres ne peuvent plus parler dans ${targetChannel}.`);
    } catch (error) {
        console.error("Erreur lors de la modification des permissions:", error);
        return message.channel.send("Une erreur s'est produite lors de la tentative de lock.");
    }
};
