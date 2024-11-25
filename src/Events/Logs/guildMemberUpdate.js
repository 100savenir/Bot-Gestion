const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const guildId = oldMember.guild.id;
        const salonid = await db.get(`roleLogsChannel_${guildId}`);
        if (!salonid) return;

        const salon = oldMember.guild.channels.cache.get(salonid) || newMember.guild.channels.cache.get(salonid);
        if (!salon) return;

        const roleadd = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const roledel = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        const auditLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberRoleUpdate 
        });
        const auditrole = auditLogs.entries.first();

        let executor = null;
        if (auditrole && (auditrole.target.id === newMember.id || auditrole.target.id === oldMember.id)) {
            executor = auditrole.executor;
        }

        roleadd.forEach(role => {
            const embed = new EmbedBuilder()
                .setDescription(`📥 ${executor ? executor : 'Quelqu\'un'} a ajouté le rôle ${role} à \`${newMember.user.username}\``)
                .setFooter({ text: newMember.user.username, iconURL: newMember.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            salon.send({ embeds: [embed] });
        });

        roledel.forEach(role => {
            const embed = new EmbedBuilder()
                .setDescription(`📤 ${executor ? executor : 'Quelqu\'un'} a retiré le rôle ${role} à \`${oldMember.user.username}\``)
                .setFooter({ text: oldMember.user.username, iconURL: oldMember.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            salon.send({ embeds: [embed] });
        });
    },
};
