const { QuickDB } = require('quick.db');
const { AuditLogEvent, Events, EmbedBuilder } = require('discord.js');
const db = new QuickDB();

module.exports = {
    name: Events.GuildMemberAdd, // Utilise la constante de l'événement
    /**
     * @param {GuildMember} member - Le membre ajouté
     */
    async execute(member, client) {
        // Vérifie si le membre ajouté est un bot
        if (!member.user.bot) return;

        // Récupère le mode antibot actuel
        const antibotMode = await db.get('antibot_mode') || 'off';

        // Récupère la liste des whitelist, owners et buyers
        const whitelist = await db.get('whitelist') || [];
        const owners = await db.get('owners') || [];
        const buyers = await db.get('buyers') || [];
        const buyer = member.client.config.clients.buyer;

        // Récupération des logs d'audit pour trouver qui a ajouté le bot
        const guild = member.guild;
        const auditLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.BotAdd, // Utilisation de la constante correcte
        });

        const botAddLog = auditLogs.entries.first();

        if (!botAddLog) return; // Si aucune log n'est trouvée, on arrête ici.

        const { executor } = botAddLog; // `executor` est la personne ayant ajouté le bot.
        const executorId = executor.id;

        // Ne rien faire si le mode est sur 'off'
        if (antibotMode === 'off') return;

        // Vérification des personnes "protégées"
        const isWhitelisted = whitelist.includes(executorId);
        const isOwner = owners.includes(executorId);
        const isBuyer = buyers.includes(executorId) || executorId === buyer;

        // Fonction pour envoyer le message dans le bon canal
        const sendLogMessage = async (messageContent) => {
            const modLogsChannelId = await db.get(`modLogsChannel_${guild.id}`);
            const modLogsChannel = modLogsChannelId ? guild.channels.cache.get(modLogsChannelId) : null;
            if (modLogsChannel) {
                // Si un salon de logs de modération est défini, envoie le message dans ce salon
                modLogsChannel.send(messageContent);
            } else {
                // Sinon, envoie un message privé au buyer
                const buyerUser = await guild.members.fetch(buyer);
                if (buyerUser) {
                    buyerUser.send(messageContent).catch(error => console.error('Erreur lors de l\'envoi du message privé au buyer:', error));
                }
            }
        };

        // Si le mode est sur 'on'
        if (antibotMode === 'on') {
            if (!isWhitelisted && !isOwner && !isBuyer) {
                // Kick le bot ajouté
                try {
                    await member.kick('Antibot mode ON - Bot ajouté par un utilisateur non autorisé.');
                    // Kick la personne ayant ajouté le bot
                    await guild.members.kick(executorId, 'Antibot mode ON - Utilisateur a ajouté un bot.');
                    const embed = new EmbedBuilder()
                        .setDescription(`${executor} à été ban en essayant d'ajouter le bot ${member}`)
                        .setColor(client.config.clients.embedColor)
                        .setTimestamp();
                    sendLogMessage({ embeds: [embed]});
                } catch (error) {
                    console.error('Erreur lors du kick:', error);
                }
            }
        }

        // Si le mode est sur 'max'
        if (antibotMode === 'max') {
            if (!isBuyer && executorId !== buyer) {
                // Ban le bot ajouté
                try {
                    await member.ban({ reason: 'Antibot mode MAX - Bot ajouté par un utilisateur non autorisé.' });
                    // Ban la personne ayant ajouté le bot
                    await guild.members.ban(executorId, { reason: 'Antibot mode MAX - Utilisateur a ajouté un bot.' });
                    const embed = new EmbedBuilder()
                        .setDescription(`${executor} à été ban en essayant d'ajouter le bot ${member}`)
                        .setColor(client.config.clients.embedColor)
                        .setTimestamp();
                    sendLogMessage({ embeds: [embed]});
                } catch (error) {
                    console.error('Erreur lors du ban:', error);
                }
            }
        }
    }
};
