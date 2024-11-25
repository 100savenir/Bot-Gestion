const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'moove',
    aliases: [],
    description: "Déplace un utilisateur dans le canal vocal de l'exécutant."
};

exports.run = async (client, message, args) => {
    const executant = message.author.id;
    const buyer = client.config.clients.buyer;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];
    let whitelist = await db.get('whitelist') || [];

    if (!owners.includes(executant) && !buyers.includes(executant) && !whitelist.includes(executant) && executant !== buyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez saisir une ID ou une mention.");
    }

    const idmec = args[0].replace(/[\\<>@!]/g, '');
    const mec = message.guild.members.cache.get(idmec);

    if (!mec) {
        return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
    }

    const executantenvoc = message.member.voice.channel;

    if (!executantenvoc) {
        return message.channel.send("Vous devez être dans un canal vocal pour utiliser cette commande.");
    }

    const leboug = mec.voice.channel;

    if (!leboug) {
        return message.channel.send(`${mec} n'est pas en vocal.`);
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return message.channel.send("Je n'ai pas la permission de déplacer des membres.");
    }

    if (mec.roles.highest.position >= message.guild.members.me.roles.highest.position) {
        return message.channel.send("Je ne peux pas déplacer cet utilisateur car il a un rôle supérieur ou égal au mien.");
    }

    try {
        await mec.voice.setChannel(executantenvoc);
        const embed = new EmbedBuilder()
            .setDescription(`${mec} a été déplacé dans ${executantenvoc}`)
            .setColor(client.config.clients.embedColor);
        return message.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Erreur lors du déplacement de ${mec.displayName}:`, error);
        return message.channel.send("Une erreur s'est produite lors du déplacement de l'utilisateur.");
    }
};
