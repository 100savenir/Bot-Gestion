const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

exports.help = {
    name: 'ticketConfig',
    description: 'Affiche et gère la configuration du système de tickets.',
};

exports.run = async (client, message) => {
    let ticketConfig = {
        salon: 'Aucun',
        message: 'Message automatique',
        titre: 'Boutons',
        claim: 'Désactivé',
        autoclaim: '❌',
        suppAutoTickets: '✅',
        maxTickets: '1',
        fermerMembreQuitte: '❌',
        fermetureInactifs: '❌',
        boutonClaim: '✅',
        boutonClose: '✅',
        transcriptMP: '❌',
        rolesRequis: 'Aucun',
        rolesInterdits: 'Aucun',
        options: 'Aucune'
    };

    const createEmbed = () => {
        return new EmbedBuilder()
            .setTitle('Configuration des Tickets')
            .setColor(client.config.clients.embedColor)
            .addFields(
                { name: 'Salon', value: ticketConfig.salon, inline: true },
                { name: 'Message', value: ticketConfig.message, inline: true },
                { name: 'Titre', value: ticketConfig.titre, inline: true },
                { name: 'Claim', value: ticketConfig.claim, inline: true },
                { name: 'Autoclaim', value: ticketConfig.autoclaim, inline: true },
                { name: 'Suppression automatique des tickets fermés', value: ticketConfig.suppAutoTickets, inline: true },
                { name: 'Nombre maximum de tickets par personne', value: ticketConfig.maxTickets, inline: true },
                { name: 'Fermer automatiquement les tickets des membres quittant le serveur', value: ticketConfig.fermerMembreQuitte, inline: true },
                { name: 'Fermeture automatique des tickets inactifs', value: ticketConfig.fermetureInactifs, inline: true },
                { name: 'Bouton claim', value: ticketConfig.boutonClaim, inline: true },
                { name: 'Bouton close', value: ticketConfig.boutonClose, inline: true },
                { name: 'Transcript MP', value: ticketConfig.transcriptMP, inline: true },
                { name: 'Rôles requis', value: ticketConfig.rolesRequis, inline: true },
                { name: 'Rôles interdits', value: ticketConfig.rolesInterdits, inline: true },
                { name: 'Options', value: ticketConfig.options, inline: true }
            );
    };

    const manageOptionsMenu = new StringSelectMenuBuilder()
        .setCustomId('manage-options')
        .setPlaceholder('Gérer les options')
        .addOptions([
            {
                label: 'Ajouter une option...',
                value: 'add-option',
                emoji: '➕',
            },
        ]);

    const ticketConfigMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket-config')
        .setPlaceholder('Configuration des tickets')
        .addOptions([
            {
                label: 'Modifier le salon',
                value: 'modify-channel',
                emoji: '🏷️',
            },
            {
                label: 'Envoyer un message automatique',
                value: 'auto-message',
                emoji: '💬',
            },
            {
                label: 'Utiliser le dernier message du salon',
                value: 'use-last-message',
                emoji: '⬆️',
            },
            {
                label: 'Type bouton/selecteur',
                value: 'toggle-button-selector',
                emoji: '🔁',
            },
            {
                label: 'Suppression automatique des tickets fermés',
                value: 'auto-close',
                emoji: '✂️',
            },
        ]);

    const actionRow1 = new ActionRowBuilder().addComponents(manageOptionsMenu);
    const actionRow2 = new ActionRowBuilder().addComponents(ticketConfigMenu);

    let sentMessage = await message.channel.send({
        embeds: [createEmbed()],
        components: [actionRow1, actionRow2],
    });

    const filter = (interaction) => interaction.isSelectMenu();
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
        const choice = interaction.values[0];

        if (interaction.customId === 'ticket-config') {
            if (choice === 'modify-channel') {
                await interaction.reply({
                    content: 'Quel est le salon du menu de ticket ? Mentionne-le ou envoie l\'ID.',
                    ephemeral: true,
                });

                const filter = (m) => m.author.id === message.author.id;
                const collector = message.channel.createMessageCollector({ filter, time: 30000 });

                collector.on('collect', async (msg) => {
                    const mentionedChannel = msg.mentions.channels.first() || msg.guild.channels.cache.get(msg.content);

                    if (mentionedChannel) {
                        ticketConfig.salon = `${mentionedChannel}`;
                        await message.channel.send(`Le salon a été défini à ${mentionedChannel}.`);
                        await sentMessage.edit({ embeds: [createEmbed()] });
                        collector.stop();
                    } else {
                        await message.channel.send('Salon invalide. Veuillez mentionner un salon ou fournir un ID valide.');
                    }
                });

            } else if (choice === 'auto-message') {
                ticketConfig.message = 'Message automatique';
                await sentMessage.edit({ embeds: [createEmbed()] });
                await interaction.reply({ content: 'Le message automatique a été activé.', ephemeral: true });

            } else if (choice === 'use-last-message') {
                const channel = message.guild.channels.cache.get(ticketConfig.salon);
                if (channel) {
                    const lastMessage = await channel.messages.fetch({ limit: 1 });
                    const messageId = lastMessage.first().id;
                    const messageLink = `https://discord.com/channels/${message.guild.id}/${channel.id}/${messageId}`;
                    ticketConfig.message = `[${messageId}](${messageLink})`;
                    await sentMessage.edit({ embeds: [createEmbed()] });
                    await interaction.reply({ content: 'Dernier message du salon utilisé.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Salon invalide.', ephemeral: true });
                }

            } else if (choice === 'toggle-button-selector') {
                ticketConfig.titre = ticketConfig.titre === 'Boutons' ? 'Sélecteur' : 'Boutons';
                await sentMessage.edit({ embeds: [createEmbed()] });
                await interaction.reply({ content: `Type de titre modifié : ${ticketConfig.titre}.`, ephemeral: true });

            } else if (choice === 'auto-close') {
                ticketConfig.suppAutoTickets = ticketConfig.suppAutoTickets === '✅' ? '❌' : '✅';
                await sentMessage.edit({ embeds: [createEmbed()] });
                await interaction.reply({ content: `Suppression automatique des tickets fermés : ${ticketConfig.suppAutoTickets}.`, ephemeral: true });
            }
        }
    });

    collector.on('end', async () => {
        await sentMessage.edit({ components: [] });
    });
};
