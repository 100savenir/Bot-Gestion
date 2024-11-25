const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildCreate',
    /**
     * @param {import('discord.js').Guild} guild
     * @param {import('discord.js').Client} client
     */
    async execute(guild, client) {
        const buyerIds = client.config.clients.buyer;
        const owners = await db.get('owners') || [];
        const buyers = await db.get('buyers') || [];

        const recipients = new Set([...buyerIds, ...owners, ...buyers]);

        // Création de l'embed
        const guildOwner = await guild.fetchOwner();

        const boostCount = guild.premiumSubscriptionCount;
        const boostText = boostCount > 0 ? `${boostCount} boost(s)` : "Pas de boost";

        const creationDate = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

        const customURL = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : "Pas d'URL personnalisée";

        const embed = new EmbedBuilder()
            .setTitle('Ajout')
            .setThumbnail(guild.iconURL())
            .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
            .setTimestamp()
            .setDescription(`**Nom du serveur** : ${guild.name}\n**Identifiant** : ${guild.id}\n**Owner** : <@${guildOwner.id}>\n**Membres** : ${guild.memberCount}\n**Boost** : ${boostText}\n**Date de création** : ${creationDate}\n**URL personnalisée** : ${customURL}\n**Ajouté par** : <@${guildOwner.id}>`)
            .setColor('#90EE90');

        // Envoyer l'embed aux buyers, owners, et buyers dans la DB
        for (const recipientId of recipients) {
            try {
                const user = await client.users.fetch(recipientId);
                if (user) {
                    await user.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error(`Erreur lors de l'envoi du message à l'utilisateur ${recipientId}:`, error);
            }
        }
    }
};
