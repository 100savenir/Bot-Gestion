const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildBanRemove',
    async execute(ban, client) {
        const guildId = ban.guild.id;
        const logChannelId = await db.get(`modLogsChannel_${guildId}`);
        if (!logChannelId) return;

        const logChannel = ban.guild?.channels?.cache?.get(logChannelId);
        if (!logChannel) return;

        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanRemove,
        });

        const log = fetchedLogs.entries.find(entry => entry.target.id === ban.user.id && Date.now() - entry.createdTimestamp < 5000);
        if (!log) return;

        const { executor, target } = log;

        const embed = new EmbedBuilder()
            .setDescription(`${executor} a unban ${target}`)
            .setColor(client.config.clients.embedColor)
            .setFooter({ text: executor.username, iconURL: executor.displayAvatarURL() })
            .setTimestamp();
        logChannel.send({ embeds: [embed] });
    }
};
