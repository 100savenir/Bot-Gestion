const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { EmbedBuilder } = require('discord.js');

exports.help = {
    name: 'theme',
    description: "Change la couleur du thème du bot.",
    aliases: ['couleur', 'color']
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';

    let owners = await db.get(ownersKey) || [];
    if (!Array.isArray(owners)) {
        owners = [];
    }

    if (userId !== buyerId && !owners.includes(userId)) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez saisir la nouvelle couleur en hexadécimal (ex: #ff0000) ou en nom de couleur (ex: red, blue).");
    }

    let colorValue = args[0].trim().toLowerCase();
    let descriptionText;

    if (colorValue === 'reset') {
        colorValue = '#ff0000'; // Couleur d'origine
        descriptionText = 'Le thème à correctement été reset.';
        const resetEmbed = new EmbedBuilder()
            .setColor(colorValue)
            .setTitle('Thème Reset')
            .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
            .setDescription(descriptionText);

        await db.set('embedColor', colorValue);
        return message.channel.send({ embeds: [resetEmbed] });
    } else {
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

        if (colorMap[colorValue]) {
            colorValue = colorMap[colorValue];
        } else {
            const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
            if (!hexColorRegex.test(colorValue)) {
                return message.channel.send('Couleur invalide. Veuillez envoyer une couleur valide en hexadécimal (ex: #ff0000) ou un nom de couleur (ex: red, blue).');
            }
        }

        descriptionText = `Le thème a été mis à jour en : **${args[0]}** *\`(${colorValue})\`*`;
    }

    client.config.clients.embedColor = colorValue;
    await db.set('embedColor', colorValue);

    const embed = new EmbedBuilder()
        .setColor(colorValue)
        .setTitle('Thème mis à jour')
        .setDescription(descriptionText)
        .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo });

    message.channel.send({ embeds: [embed] });
};
