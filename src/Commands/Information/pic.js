const { EmbedBuilder } = require('discord.js');

exports.help = {
    name: 'pic',
    description: "Permet de récupérer la pdp d’un membre.",
    aliases: ['avatar']
};

exports.run = async (client, message, args) => {
    let member;
    if (!args.length) {
        member = message.member;
    } else {
        member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    }

    const embed = new EmbedBuilder()
       .setTitle(`Avatar de \`${member.user.username}\``)
       .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
       .setTimestamp()
       .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
       .setColor(client.config.clients.embedColor);

    message.channel.send({ embeds: [embed] });
};