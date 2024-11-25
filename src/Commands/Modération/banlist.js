const { ButtonBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'banlist',
    aliases: ['bannedlist'],
    description: "Affiche la liste des membres bannis sur le serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const prefix = client.config.clients.prefix;
    const banlistKey = `banlist_${message.guild.id}`;

    if (!await isAllowed(userId, client.config.clients)) {
        return;
    }

    let banlist = await db.get(banlistKey) || [];
    const bannedMembers = await message.guild.bans.fetch();

    banlist = bannedMembers.map(banInfo => ({
        id: banInfo.user.id,
        username: banInfo.user.username,
        reason: banInfo.reason || "Aucune raison spécifiée"
    }));

    await db.set(banlistKey, banlist);

    if (banlist.length === 0) {
        return message.channel.send("Aucun membre n'est actuellement banni sur ce serveur.");
    }

    const itemsPerPage = 10;
    let page = 0;
    const totalPages = Math.ceil(banlist.length / itemsPerPage);

    const generateEmbed = (pageIndex) => {
        const startIndex = pageIndex * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const paginatedList = banlist.slice(startIndex, endIndex);

        const description = paginatedList.map(member => {
            const { username, reason } = member;
            return `\`${username}\` **:** \`${reason}\``;
        }).join('\n');

        return new EmbedBuilder()
            .setTitle("BanList")
            .setColor(client.config.clients.embedColor)
            .setDescription(description)
            .setFooter({ text: `WhyNotBot・${pageIndex + 1}/${totalPages}`, iconURL: client.config.clients.logo });
    };

    const embed = generateEmbed(page);
    const rows = generateButtons(page, totalPages);

    const sentMessage = await message.channel.send({
        embeds: [embed],
        components: rows.map(row => row.toJSON())
    });

    const filter = i => i.user.id === userId && ['prev', 'next'].includes(i.customId);
    const collector = sentMessage.createMessageComponentCollector({ filter });

    collector.on('collect', async interaction => {
        if (interaction.customId === 'prev') {
            page--;
        } else if (interaction.customId === 'next') {
            page++;
        }

        const updatedEmbed = generateEmbed(page);
        const updatedRows = generateButtons(page, totalPages);

        await interaction.update({
            embeds: [updatedEmbed],
            components: updatedRows.map(row => row.toJSON())
        });
    });

    collector.on('end', collected => {
        sentMessage.edit({ components: [] }).catch(console.error);
    });
};

async function isAllowed(userId, config) {
    const { buyer } = config;
    const owners = await db.get('owners') || [];
    const whitelist = await db.get('whitelist') || [];

    return userId === buyer || owners.includes(userId) || whitelist.includes(userId);
}

function generateButtons(pageIndex, totalPages) {
    const components = [];

    if (pageIndex > 0) {
        components.push(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀︎')
                .setStyle(ButtonStyle.Primary)
        );
    }

    if (pageIndex < totalPages - 1) {
        components.push(
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶︎')
                .setStyle(ButtonStyle.Primary)
        );
    }

    const rows = [];
    for (let i = 0; i < components.length; i += 5) {
        const rowComponents = components.slice(i, i + 5);
        const row = new ActionRowBuilder().addComponents(rowComponents);
        rows.push(row);
    }

    return rows;
}
