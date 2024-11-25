const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author.bot) return;

        const guildId = oldMessage.guild.id;
        const salonid = await db.get(`msgLogsChannel_${guildId}`);
        if (!salonid) return;

        const salon = oldMessage.guild.channels.cache.get(salonid);
        if (!salon) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Modifié')
            .setColor(client.config.clients.embedColor)
            .addFields(
                { name: 'Ancien message', value: oldMessage.content || 'N/A', inline: true },
                { name: 'Nouveau message', value: newMessage.content || 'N/A', inline: false }
            )
            .setFooter({ text: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL() })
            .setTimestamp();

        salon.send({ embeds: [embed] });
    },
};
