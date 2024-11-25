const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'unbanall',
    aliases: [],
    description: "Débannir tous les utilisateurs bannis du serveur. Accessible uniquement aux buyers, owners et au buyer originel."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;
    const guildId = message.guild.id;

    // Récupération des listes de buyers et owners
    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];

    // Vérifie si l'utilisateur est dans la liste des buyers, owners ou s'il est le buyer originel
    if (!owners.includes(userId) && !buyers.includes(userId) && userId !== buyer) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    try {
        // Récupère tous les utilisateurs bannis
        const bans = await message.guild.bans.fetch();
        if (bans.size === 0) {
            return message.channel.send("Aucun utilisateur banni trouvé.");
        }

        // Itère sur tous les utilisateurs bannis et les débannit
        for (const banInfo of bans.values()) {
            await message.guild.members.unban(banInfo.user.id);
        }

        message.channel.send(`Tous les utilisateurs bannis (${bans.size}) ont été débannis avec succès.`);
        
        // Si un salon de logs est défini, envoie un message dans ce salon
        const modLogsChannelId = await db.get(`modLogsChannel_${guildId}`);
        if (modLogsChannelId) {
            const logChannel = message.guild.channels.cache.get(modLogsChannelId);
            if (logChannel) {
                logChannel.send(`${message.author.tag} a utilisé la commande \`unbanall\` pour débannir ${bans.size} utilisateur(s).`);
            }
        }

    } catch (error) {
        console.error('Erreur lors du débanissement des utilisateurs :', error);
        message.channel.send("Une erreur s'est produite lors du débanissement des utilisateurs.");
    }
};
