const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const guildId = oldState.guild.id || newState.guild.id;
        const salonid = await db.get(`voiceLogsChannel_${guildId}`);
        if (!salonid) return;

        const salon = oldState.guild.channels.cache.get(salonid) || newState.guild.channels.cache.get(salonid);
        if (!salon) return;

        const member = newState.member;
        const executant = oldState.member;

        if (!oldState.channel && newState.channel) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} a rejoint ${newState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }

        if (oldState.channel && !newState.channel) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} a quitté ${oldState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }

        if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} a quitté ${oldState.channel} et a rejoint ${newState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }

        if (!oldState.streaming && newState.streaming) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} partage son écran dans ${newState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }

        if (oldState.streaming && !newState.streaming) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} a arrêté son partage d'écran dans ${newState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }

        if (!oldState.selfVideo && newState.selfVideo) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} a activé sa caméra dans ${newState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }

        if (oldState.selfVideo && !newState.selfVideo) {
            const embed = new EmbedBuilder()
                .setDescription(`${member} a désactivé sa caméra dans ${newState.channel}`)
                .setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL() })
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            return salon.send({ embeds: [embed] });
        }
    },
};
