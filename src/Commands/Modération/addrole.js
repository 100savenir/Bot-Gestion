const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

exports.help = {
    name: 'addrole',
    description: "Ajoute un rôle à un membre."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners et buyers depuis la base de données
    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];

    if (!owners.includes(userId) && !buyers.includes(userId) && userId !== buyer) {
        return;
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez mentionner/saisir l'id du membre à qui ajouter le rôle.");
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
        return message.channel.send("Veuillez mentionner/saisir l'id du membre à qui ajouter le rôle.");
    }

    if (args.length < 2) {
        return message.channel.send("Veuillez mentionner le nom du rôle à ajouter.");
    }

    const roleName = args.slice(1).join(" ");
    const roles = message.guild.roles.cache.filter(r => r.name.toLowerCase().includes(roleName.toLowerCase()));

    if (roles.size === 0) {
        return message.channel.send(`Aucun rôle trouvé pour : \`${roleName}\``);
    }

    if (roles.size === 1) {
        const role = roles.first();
        if (member.roles.cache.has(role.id)) {
            return message.channel.send(`\`${member.user.username}\` possède déjà le rôle \`${role.name}\`.`);
        }

        try {
            await member.roles.add(role);
            return message.channel.send(`Le rôle \`${role.name}\` a été ajouté à \`${member.user.username}\`.`);
        } catch (error) {
            console.error("Erreur lors de l'ajout du rôle:", error);
            return message.channel.send("Une erreur s'est produite lors de la tentative d'ajout du rôle.");
        }
    }

    const roleOptions = roles.map(role => ({
        label: role.name,
        value: role.id
    }));

    const embed = new EmbedBuilder()
        .setTitle(`${roles.size} rôles trouvés pour : \`${roleName}\``)
        .setColor(client.config.clients.embedColor);

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectRole')
                .setPlaceholder('Sélectionner un rôle')
                .addOptions(roleOptions)
        );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.customId === 'selectRole' && i.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        const selectedRoleId = interaction.values[0];
        const role = message.guild.roles.cache.get(selectedRoleId);

        try {
            await member.roles.add(role);
            await sentMessage.delete();
            return message.channel.send(`Le rôle \`${role.name}\` a été ajouté à \`${member.user.username}\`.`);
        } catch (error) {
            console.error("Erreur lors de l'ajout du rôle:", error);
            return message.channel.send("Une erreur s'est produite lors de la tentative d'ajout du rôle.");
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            sentMessage.edit({ content: 'Temps écoulé pour la sélection du rôle.', components: [] });
        }
    });
};
