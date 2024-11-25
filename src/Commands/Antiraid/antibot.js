const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'antibot',
    aliases: ['botmode'],
    description: "Active, désactive ou met le mode antibot au maximum."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];

    // Vérification des permissions de l'utilisateur
    if (!owners.includes(userId) && !buyers.includes(userId) && userId !== buyer) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    // Vérification de l'argument passé
    if (!args.length || !['on', 'off', 'max'].includes(args[0].toLowerCase())) {
        return message.channel.send("Veuillez spécifier une option valide : `on`, `off`, ou `max`.");
    }

    const mode = args[0].toLowerCase(); // Récupération du mode (on, off, max)

    try {
        // Mise à jour du mode dans la base de données
        await db.set('antibot_mode', mode);
        return message.channel.send(`Le mode antibot a été réglé sur \`${mode}\`.`);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du mode antibot:", error);
        return message.channel.send("Erreur lors de la mise à jour du mode antibot. Veuillez réessayer.");
    }
};
