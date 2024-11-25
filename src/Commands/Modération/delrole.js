const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'delrole',
    aliases: ['removerole'],
    description: "Supprime un rôle d'un membre."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];

    if (!owners.includes(userId) && userId !== buyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez mentionner/saisir l'id du membre à qui retirer le rôle.");
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
        return message.channel.send("Veuillez mentionner/saisir l'id du membre à qui retirer le rôle.");
    }

    if (args.length < 2) {
        return message.channel.send("Veuillez mentionner/saisir l'id du rôle à retirer.");
    }

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
        return message.channel.send("Veuillez mentionner/saisir l'id du rôle à retirer.");
    }

    if (!member.roles.cache.has(role.id)) {
        return message.channel.send(`\`${member.user.username}\` n'a pas le rôle \`${role.name}\`.`);
    }

    try {
        await member.roles.remove(role);
        return message.channel.send(`Le rôle \`${role.name}\` a été retiré à \`${member.user.username}\`.`);
    } catch (error) {
        console.error("Erreur lors du retrait du rôle:", error);
        return message.channel.send("Une erreur s'est produite lors de la tentative de retrait du rôle.");
    }
};
