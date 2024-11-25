const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'mybot',
    description: "Envoie un message si l'utilisateur est un owner, un buyer enregistré ou le buyer configuré."
};

exports.run = async (client, message) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;

    const isBuyer = userId === buyerId;
    const buyers = await db.get('buyers') || [];
    const isRegisteredBuyer = buyers.includes(userId);

    if (!isBuyer && !isRegisteredBuyer) {
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('MyBot')
        .setDescription(`Cliquez ici pour inviter votre bot\n**[${client.user.tag}](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=0)**`)
        .setThumbnail('https://cdn.discordapp.com/avatars/1212806739666276546/71883e70768de2e50dbb6ca386e15ee0.png?size=1024')
        .setColor(client.config.clients.embedColor)
        .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo });

    message.channel.send({ embeds: [embed] });
};
