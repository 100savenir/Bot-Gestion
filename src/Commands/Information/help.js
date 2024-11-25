const { ButtonBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'help',
    description: "Permet de connaître les commandes du bot.",
    aliases: ['aide']
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const prefix = client.config.clients.prefix;

    const commandsPath = path.join(__dirname, '../../Commands');
    if (!fs.existsSync(commandsPath)) {
        console.error(`Le chemin ${commandsPath} n'existe pas.`);
        return message.channel.send("Le chemin des commandes n'existe pas. Veuillez vérifier la configuration du bot.");
    }

    const commandFolders = fs.readdirSync(commandsPath);
    if (commandFolders.length === 0) {
        return message.channel.send("Aucun dossier de commande trouvé.");
    }

    let typeHelp = await db.get('typeHelp') || 'button';

    if (args[0]) {
        const commandName = args[0].toLowerCase();
        let command = null;

        // Recherche de la commande par nom ou alias
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const cmd = require(path.join(folderPath, file));
                if (cmd.help.name === commandName || (cmd.help.aliases && cmd.help.aliases.includes(commandName))) {
                    command = cmd;
                    break;
                }
            }

            if (command) break;
        }

        // Si la commande est trouvée, afficher ses détails
        if (command) {
            const commandEmbed = new EmbedBuilder()
                .setTitle(`Commande : \`${prefix}${command.help.name}\``)
                .setColor(client.config.clients.embedColor)
                .setDescription(`**Description :** ${command.help.description || "Aucune description"}
                                 **Alias :** ${command.help.aliases ? command.help.aliases.join(', ') : "Aucun"}
                                 **Usage :** \`${command.help.usage ? `${prefix}${command.help.usage}` : "Non défini"}\``)
                .setFooter({ text: `${client.config.clients.name}`, iconURL: client.config.clients.logo });

            return message.channel.send({ embeds: [commandEmbed] });
        } else {
            return message.channel.send("Commande non trouvée.");
        }
    }

    let currentFolderIndex = 0;

    const categoryEmojis = {
        'Bot Géstion': '1255245726275993671',
        'Géstion': '1258121270910783549',
        'Information': '1232347968393314405',
        'Logs': '1258119751318638704',
        'Modération': '1240185729556942908',
        'Voice': '1231633431822209085'
    };

    const generateEmbed = (folder) => {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        const commandsList = commandFiles.map(file => {
            const command = require(path.join(folderPath, file));
            return `\`${prefix}${command.help.name}\`\n${command.help.description || "Aucune description pour le moment"}\n`;
        }).join('\n');

        return new EmbedBuilder()
            .setFooter({ text: `${client.config.clients.name}・Préfixe actuel : ${prefix}`, iconURL: client.config.clients.logo })
            .setColor(client.config.clients.embedColor)
            .setThumbnail(client.config.clients.thumbnail)
            .setTitle(`**${folder}**`)
            .setDescription(commandsList);
    };

    const generateButtons = () => {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀︎')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶︎')
                    .setStyle(ButtonStyle.Primary)
            );
    };

    const generateSelectMenu = () => {
        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Choisir une catégorie')
                    .addOptions(commandFolders.map(folder => ({
                        label: folder,
                        value: folder,
                        emoji: categoryEmojis[folder] || '📁'
                    })))
            );
    };

    const embed = generateEmbed(commandFolders[currentFolderIndex]);
    const buttons = generateButtons();
    const selectMenu = generateSelectMenu();

    let components = [];
    if (typeHelp === 'button') {
        components.push(buttons);
    } else if (typeHelp === 'selecteur') {
        components.push(selectMenu);
    } else if (typeHelp === 'hybride') {
        components.push(selectMenu, buttons);
    }

    const sentMessage = await message.channel.send({ embeds: [embed], components });

    const filter = i => {
        if (i.user.id !== userId) {
            i.reply({ content: `Vous ne pouvez pas utiliser ce message. Utilisez \`${prefix}help\`.`, ephemeral: true });
            return false;
        }
        return true;
    };

    const collector = sentMessage.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async interaction => {
        if (interaction.customId === 'prev') {
            currentFolderIndex = (currentFolderIndex === 0) ? commandFolders.length - 1 : currentFolderIndex - 1;
        } else if (interaction.customId === 'next') {
            currentFolderIndex = (currentFolderIndex === commandFolders.length - 1) ? 0 : currentFolderIndex + 1;
        } else if (interaction.customId === 'select') {
            currentFolderIndex = commandFolders.indexOf(interaction.values[0]);
        }

        const updatedEmbed = generateEmbed(commandFolders[currentFolderIndex]);
        await interaction.update({ embeds: [updatedEmbed], components });
    });

    collector.on('end', () => {
        sentMessage.edit({ components: [] });
    });
};
