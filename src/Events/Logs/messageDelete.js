const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (message.author.bot) return;

        const guildId = message.guild.id;
        const salonid = await db.get(`msgLogsChannel_${guildId}`);
        if (!salonid) return;

        const salon = message.guild.channels.cache.get(salonid);
        if (!salon) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Supprimé')
            .setColor(client.config.clients.embedColor)
            .addFields(
                { name: 'Message', value: message.content || 'N/A', inline: true }
            )
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        salon.send({ embeds: [embed] });
    },
};
