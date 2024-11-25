const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

exports.help = {
    name: 'helpall',
    description: 'Affiche toutes les commandes du bot, organisées par catégorie.',
    aliases: ['aidetout', 'aideall']
};

exports.run = async (client, message) => {
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

    const helpEmbed = new EmbedBuilder()
        .setTitle('Helpall')
        .setColor(client.config.clients.embedColor)
        .setFooter({ text: `${client.config.clients.name}・Préfixe actuel : ${prefix}`, iconURL: client.config.clients.logo });

    commandFolders.forEach(folder => {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        const commandsList = commandFiles.map(file => {
            const command = require(path.join(folderPath, file));
            return `\`${prefix}${command.help.name}\``;
        }).join(', ');

        helpEmbed.addFields({ name: folder, value: commandsList || "Aucune commande trouvée", inline: false });
    });

    message.channel.send({ embeds: [helpEmbed] });
};
