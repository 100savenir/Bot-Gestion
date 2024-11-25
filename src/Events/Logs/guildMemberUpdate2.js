const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

function formatDuration(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 7);
    const weeks = Math.floor(duration / (1000 * 60 * 60 * 24 * 7));

    let result = [];
    if (weeks) result.push(`${weeks} semaine${weeks > 1 ? 's' : ''}`);
    if (days) result.push(`${days} jour${days > 1 ? 's' : ''}`);
    if (hours) result.push(`${hours} heure${hours > 1 ? 's' : ''}`);
    if (minutes) result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds) result.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`);

    return result.join(', ');
}

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const guildId = oldMember.guild.id;
        const logChannelId = await db.get(`modLogsChannel_${guildId}`);
        if (!logChannelId) return;

        const logChannel = oldMember.guild?.channels?.cache?.get(logChannelId) || newMember.guild?.channels?.cache?.get(logChannelId);
        if (!logChannel) return;

        const auditLogTypes = [
            AuditLogEvent.MemberUpdate,
            AuditLogEvent.MemberKick,
            AuditLogEvent.MemberBanAdd,
            AuditLogEvent.MemberBanRemove
        ];

        for (const type of auditLogTypes) {
            const fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type });

            const log = fetchedLogs.entries.find(entry => entry.target.id === newMember.id && Date.now() - entry.createdTimestamp < 5000);
            if (!log) continue;

            const { executor, target, changes, action } = log;
            const change = changes[0];

            if (action === AuditLogEvent.MemberUpdate && change.key === 'communication_disabled_until') {
                if (change.new) {
                    let time;
                    if (change.old) {
                        const duration = new Date(change.new) - new Date(change.old);
                        time = formatDuration(duration);
                    } else {
                        const duration = new Date(change.new) - Date.now();
                        time = formatDuration(duration);
                    }

                    const embed = new EmbedBuilder()
                        .setDescription(`${executor} a timeout ${target} pendant \`${time}\``)
                        .setColor(client.config.clients.embedColor)
                        .setFooter({ text: executor.username, iconURL: executor.displayAvatarURL() })
                        .setTimestamp();
                    logChannel.send({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setDescription(`${executor} a unmute ${target}`)
                        .setColor(client.config.clients.embedColor)
                        .setFooter({ text: executor.username, iconURL: executor.displayAvatarURL() })
                        .setTimestamp();
                    logChannel.send({ embeds: [embed] });
                }
            } else if (action === AuditLogEvent.MemberKick) {
                const embed = new EmbedBuilder()
                    .setDescription(`${executor} a kick ${target}`)
                    .setColor(client.config.clients.embedColor)
                    .setFooter({ text: executor.username, iconURL: executor.displayAvatarURL() })
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
            } else if (action === AuditLogEvent.MemberBanAdd) {
                const embed = new EmbedBuilder()
                    .setDescription(`${executor} a ban ${target}`)
                    .setColor(client.config.clients.embedColor)
                    .setFooter({ text: executor.username, iconURL: executor.displayAvatarURL() })
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
            } else if (action === AuditLogEvent.MemberBanRemove) {
                const embed = new EmbedBuilder()
                    .setDescription(`${executor} a unban ${target}`)
                    .setColor(client.config.clients.embedColor)
                    .setFooter({ text: executor.username, iconURL: executor.displayAvatarURL() })
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
            }
        }
    }
};
