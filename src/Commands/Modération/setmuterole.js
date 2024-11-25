const { PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'setmuterole',
    aliases: ['muterole'],
    description: "Définit le rôle muet pour le serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];

    if (!owners.includes(userId) && userId !== buyer) {
        return;
    }

    let muteRole;

    if (!args[0]) {
        // Créer un nouveau rôle "🔇・Muet" si aucun argument n'est fourni
        muteRole = await message.guild.roles.create({
            name: '🔇・Muet',
            permissions: []
        });

        // Retirer les permissions de parler en vocal et d'envoyer des messages
        message.guild.channels.cache.forEach(async (channel) => {
            await channel.permissionOverwrites.edit(muteRole, {
                [PermissionsBitField.Flags.SendMessages]: false,
                [PermissionsBitField.Flags.Connect]: false
            });
        });
    } else {
        // Récupérer le rôle spécifié
        const roleId = args[0].replace(/[<@&>]/g, '');
        muteRole = message.guild.roles.cache.get(roleId);

        if (!muteRole) {
            return message.channel.send("Rôle spécifié introuvable. Veuillez vérifier l'ID ou la mention du rôle.");
        }
    }

    // Stocker l'ID du rôle muet dans la base de données spécifique au serveur
    await db.set(`muteRole_${message.guild.id}`, muteRole.id);

    return message.channel.send(`Le rôle \`${muteRole.name}\` sera le rôle muet.`);
};
