const { EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const ms = require('ms');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: "embed",
    aliases: ['embedbuilder', 'embedcreator'],
    description: "Permet de créer et personnaliser un embed",
};

exports.run = async (client, message, args, color, prefix, footer, commandName) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;

    const isBuyer = userId === buyerId;
    const owners = await db.get('owners') || [];
    const buyers = await db.get('buyers') || [];
    const isOwner = owners.includes(userId);
    const isRegisteredBuyer = buyers.includes(userId);

    if (!isBuyer && !isOwner && !isRegisteredBuyer) {
        return;
    }

    let embed = new EmbedBuilder().setDescription('\u200B');

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('embedselect_' + message.id)
        .setPlaceholder("Clique ici pour modifier l'embed")
        .addOptions([
            { label: 'Modifier le titre', value: 'title', emoji: '✏️' },
            { label: 'Modifier la description', value: 'description', emoji: '📋' },
            { label: 'Modifier le footer', value: 'footer', emoji: '🔻' },
            { label: 'Modifier le thumbnail', value: 'thumbnail', emoji: '🏷️' },
            { label: 'Modifier le timestamp', value: 'timestamp', emoji: '🕐' },
            { label: 'Modifier l\'image', value: 'image', emoji: '🖼️' },
            { label: 'Modifier la couleur', value: 'color', emoji: '🔴' }
        ]);

    const validateButton = new ButtonBuilder()
        .setCustomId('buttonvalidate_' + message.id)
        .setLabel('Validé')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success);

    const sendButton = new ButtonBuilder()
        .setCustomId('buttonsend_' + message.id)
        .setLabel('Choisir un salon où envoyer l\'embed')
        .setStyle(ButtonStyle.Primary);

    const initialRow = new ActionRowBuilder()
        .addComponents(validateButton);

    message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu), initialRow] }).then(async (msg) => {

        const selectCollector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: ms('2m') });

        selectCollector.on('collect', async (interaction) => {
            if (interaction.isStringSelectMenu()) {
                if (!interaction.values || interaction.values.length === 0) {
                    console.log('Aucune option sélectionnée.');
                    return;
                }

                const option = interaction.values[0];

                switch (option) {
                    case 'title':
                        interaction.reply('Veuillez envoyer le nouveau titre.');

                        const titleFilter = m => m.author.id === message.author.id;
                        const titleCollector = message.channel.createMessageCollector({ filter: titleFilter, max: 1, time: ms('2m') });

                        titleCollector.on('collect', async (collected) => {
                            embed.setTitle(collected.content);
                            await titleCollector.stop();
                            await interaction.deleteReply();
                            await msg.edit({ embeds: [embed] });
                            await collected.delete();
                        });

                        titleCollector.on('end', async (collected) => {
                            if (collected.size === 0) {
                                await interaction.deleteReply();
                                await message.channel.send('Temps écoulé ou aucune réponse reçue.');
                            }
                        });

                        break;

                    case 'description':
                        interaction.reply('Veuillez envoyer la nouvelle description.');

                        const descFilter = m => m.author.id === message.author.id;
                        const descCollector = message.channel.createMessageCollector({ filter: descFilter, max: 1, time: ms('2m') });

                        descCollector.on('collect', async (collected) => {
                            embed.setDescription(collected.content);
                            await descCollector.stop();
                            await interaction.deleteReply();
                            await msg.edit({ embeds: [embed] });
                            await collected.delete();
                        });

                        descCollector.on('end', async (collected) => {
                            if (collected.size === 0) {
                                await interaction.deleteReply();
                                await message.channel.send('Temps écoulé ou aucune réponse reçue.');
                            }
                        });

                        break;

                    case 'footer':
                        interaction.reply('Veuillez envoyer le texte du footer.');

                        const footerFilter = m => m.author.id === message.author.id;
                        const footerCollector = message.channel.createMessageCollector({ filter: footerFilter, max: 1, time: ms('2m') });

                        footerCollector.on('collect', async (collected) => {
                            let footerText = collected.content;

                            embed.setFooter({ text: footerText });
                            await footerCollector.stop();
                            await interaction.deleteReply();
                            await msg.edit({ embeds: [embed] });
                            await collected.delete();
                        });

                        footerCollector.on('end', async (collected) => {
                            if (collected.size === 0) {
                                await interaction.deleteReply();
                                await message.channel.send('Temps écoulé ou aucune réponse reçue.');
                            }
                        });

                        break;

                    case 'thumbnail':
                        interaction.reply('Veuillez envoyer l\'image du thumbnail.');

                        const thumbnailFilter = m => m.author.id === message.author.id;
                        const thumbnailCollector = message.channel.createMessageCollector({ filter: thumbnailFilter, max: 1, time: ms('2m') });

                        thumbnailCollector.on('collect', async (collected) => {
                            let thumbnailURL = collected.attachments.first().url;
                            embed.setThumbnail(thumbnailURL);
                            await thumbnailCollector.stop();
                            await interaction.deleteReply();
                            await msg.edit({ embeds: [embed] });
                            await collected.delete();
                        });

                        thumbnailCollector.on('end', async (collected) => {
                            if (collected.size === 0) {
                                await interaction.deleteReply();
                                await message.channel.send('Temps écoulé ou aucune réponse reçue.');
                            }
                        });

                        break;

                    case 'timestamp':
                        embed.setTimestamp();
                        await interaction.reply('Timestamp ajouté.');
                        await interaction.deleteReply();
                        await msg.edit({ embeds: [embed] });

                        break;

                    case 'image':
                        interaction.reply('Veuillez envoyer l\'image.');

                        const imageFilter = m => m.author.id === message.author.id;
                        const imageCollector = message.channel.createMessageCollector({ filter: imageFilter, max: 1, time: ms('2m') });

                        imageCollector.on('collect', async (collected) => {
                            let imageURL = collected.attachments.first().url;
                            embed.setImage(imageURL);
                            await imageCollector.stop();
                            await interaction.deleteReply();
                            await msg.edit({ embeds: [embed] });
                            await collected.delete();
                        });

                        imageCollector.on('end', async (collected) => {
                            if (collected.size === 0) {
                                await interaction.deleteReply();
                                await message.channel.send('Temps écoulé ou aucune réponse reçue.');
                            }
                        });

                        break;

                    case 'color':
                        interaction.reply('Veuillez envoyer la nouvelle couleur en hexadécimal (ex: #ff0000) ou en nom de couleur (ex: red, blue).');

                        const colorFilter = m => m.author.id === message.author.id;
                        const colorCollector = message.channel.createMessageCollector({ filter: colorFilter, max: 1, time: ms('2m') });

                        const colorMap = {
                            "white": "#FFFFFF",
                            "blanc": "#FFFFFF",
                            "black": "#000000",
                            "noir": "#000000",
                            "red": "#FF0000",
                            "rouge": "#FF0000",
                            "green": "#00FF00",
                            "vert": "#00FF00",
                            "blue": "#0000FF",
                            "bleu": "#0000FF",
                            "yellow": "#FFFF00",
                            "jaune": "#FFFF00",
                            "cyan": "#00FFFF",
                            "magenta": "#FF00FF",
                        };

                        colorCollector.on('collect', async (collected) => {
                            let colorValue = collected.content.trim().toLowerCase();

                            if (colorMap[colorValue]) {
                                colorValue = colorMap[colorValue];
                            } else {
                                const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
                                if (!hexColorRegex.test(colorValue)) {
                                    await interaction.followUp('Couleur invalide. Veuillez envoyer une couleur valide en hexadécimal (ex: #ff0000) ou un nom de couleur (ex: red, blue).');
                                    return;
                                }
                            }

                            embed.setColor(colorValue);
                            await colorCollector.stop();
                            await interaction.deleteReply();
                            await msg.edit({ embeds: [embed] });
                            await collected.delete();
                        });

                        break;

                    default:
                        break;
                }
            } else {
                console.log('Interaction de type Select Menu non gérée.');
            }
        });

        const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: ms('2m') });

        buttonCollector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.isButton()) {
                if (buttonInteraction.customId === 'buttonvalidate_' + message.id) {
                    await msg.edit({ components: [] });

                    await msg.edit({ components: [new ActionRowBuilder().addComponents(sendButton)] });

                    buttonInteraction.reply('Veuillez choisir un salon où envoyer l\'embed.');

                    const channelFilter = m => m.author.id === message.author.id;
                    const channelCollector = message.channel.createMessageCollector({ filter: channelFilter, max: 1, time: ms('2m') });

                    channelCollector.on('collect', async (collected) => {
                        let channel = collected.mentions.channels.first();
                        if (channel) {
                            await channel.send({ embeds: [embed] });
                            await channelCollector.stop();
                            await buttonInteraction.deleteReply();
                            await collected.delete();
                            await message.channel.send('Embed envoyé.');
                        } else {
                            await buttonInteraction.followUp('Salon non valide. Veuillez réessayer.');
                            await buttonInteraction.deleteReply();
                        }
                    });

                    channelCollector.on('end', async (collected) => {
                        if (collected.size === 0) {
                            await buttonInteraction.deleteReply();
                            await message.channel.send('Temps écoulé ou aucune réponse reçue.');
                        }
                    });
                }
            } else {
                console.log('Interaction non gérée ou pas un bouton.');
            }
        });
    })
}
