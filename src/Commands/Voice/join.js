const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'join',
    aliases: [],
    description: "Déplace l'exécutant dans le canal vocal de la personne mentionnée."
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
        return;
    }

    const idmec = args[0].replace(/[\\<>@!]/g, '');
    const mec = message.guild.members.cache.get(idmec);

    if (!mec) {
        return message.channel.send("Utilisateur introuvable.");
    }

    const channeldumec = mec.voice.channel;

    if (!channeldumec) {
        return message.channel.send(`${mec} n'est pas dans un canal vocal.`);
    }

    const executantMember = message.guild.members.cache.get(executant);

    if (executantMember.voice.channel && executantMember.voice.channel.id === channeldumec.id) {
        const embed = new EmbedBuilder()
            .setDescription("Vous êtes déjà dans le salon vocal.")
            .setColor(client.config.clients.embedColor);
        return message.channel.send({ embeds: [embed] });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return message.channel.send("Je n'ai pas la permission de déplacer des membres.");
    }

    try {
        await executantMember.voice.setChannel(channeldumec);
        const embed = new EmbedBuilder()
            .setDescription(`Vous avez rejoint ${mec}`)
            .setColor(client.config.clients.embedColor);
        return message.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Erreur lors du déplacement de ${executantMember.displayName}:`, error);
        return message.channel.send("Une erreur s'est produite lors du déplacement de l'utilisateur.");
    }
};
