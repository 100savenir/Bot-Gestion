const { EmbedBuilder } = require('discord.js');

exports.help = {
    name: 'banner',
    description: "Permet de récupérer la bannière d’un membre.",
    aliases: ['banniere']
};

exports.run = async (client, message, args) => {
    let member;
    if (!args.length) {
        member = message.member;
    } else {
        member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    }

    const user = await client.users.fetch(member.id, { force: true });
    let bannerURL;
    if (user.banner) {
        const bannerExtension = user.banner.startsWith('a_') ? 'gif' : 'png'; // Vérifie si la bannière est une image GIF ou PNG
        bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${bannerExtension}?size=512`;
    } else {
        bannerURL = null;
    }

    const embed = new EmbedBuilder()
       .setTitle(`Bannière de ${member.user.username}`)
       .setTimestamp()
       .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
       .setColor(client.config.clients.embedColor);

    if (bannerURL) {
        embed.setImage(bannerURL);
    } else {
        embed.setDescription("This user does not have a banner.");
    }

    message.channel.send({ embeds: [embed] });
};