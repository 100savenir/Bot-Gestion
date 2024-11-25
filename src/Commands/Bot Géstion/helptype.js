const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'sethelp',
    description: 'Définit le type de help',
    aliases: ['setaide', 'helptype']
};

exports.run = async (client, message, args) => {
    const buyers = await db.get('buyers') || [];
    const mainBuyer = client.config.clients.buyer;
    const owners = client.config.clients.owners || [];

    // Vérifier si l'utilisateur a la permission d'utiliser la commande
    if (![mainBuyer, ...buyers, ...owners].includes(message.author.id)) {
        return;
    }

    // Vérifier si un argument est fourni
    if (!args[0]) {
        return message.channel.send("Veuillez spécifier un type de help: `button`, `selector`, `selecteur`, `menu`, `selecteurmenu`, `hybride`.");
    }

    // Normaliser les choix d'arguments
    const choix = args[0].toLowerCase();
    let typeHelp;

    switch (choix) {
        case 'button':
            typeHelp = 'button';
            break;
        case 'selector':
        case 'selecteur':
        case 'menu':
        case 'selecteurmenu':
            typeHelp = 'selecteur';
            break;
        case 'hybride':
            typeHelp = 'hybride';
            break;
        default:
            return message.channel.send("Choix invalide. Veuillez spécifier un type de help valide: `button`, `selector`, `selecteur`, `menu`, `selecteurmenu`, `hybride`.");
    }

    // Stocker le type de help dans la base de données
    await db.set('typeHelp', typeHelp);

    // Envoyer un embed de confirmation
    const helpEmbed = new EmbedBuilder()
        .setTitle('Type de help défini')
        .setColor(client.config.clients.embedColor)
        .setDescription(`Type de help défini sur \`${typeHelp}\``)
        .setFooter({ text: `${client.config.clients.name}`, iconURL: client.config.clients.logo });

    message.channel.send({ embeds: [helpEmbed] });
};
