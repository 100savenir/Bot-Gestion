const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'derank',
    aliases: ['unrank'],
    description: "Retire tous les rôles d'un utilisateur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];

    if (!owners.includes(userId) && userId !== buyer) {
        return;
    }

    if (!args[0]) {
        return message.channel.send("Veuillez mentionner/fournir l'id de la personne à derank.");
    }

    const memberId = args[0].replace(/[<@!>]/g, ''); // Extraire l'ID si une mention est fournie
    const member = await message.guild.members.fetch(memberId).catch(() => null);

    if (!member) {
        return message.channel.send("Veuillez mentionner/fournir l'id de la personne à derank.");
    }

    await member.roles.set([]).catch(error => {
        console.error("Erreur lors de la suppression des rôles:", error);
        return message.channel.send("Une erreur s'est produite lors de la tentative de derank de l'utilisateur.");
    });

    return message.channel.send(`\`${member.user.username}\` à été derank.`);
};
