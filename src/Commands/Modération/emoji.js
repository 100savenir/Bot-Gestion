const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'emoji',
    aliases: ['create'],
    description: "Crée des émojis sur le serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    // Récupérer les owners depuis la base de données
    let owners = await db.get('owners') || [];

    if (!owners.includes(userId) && userId !== buyer) {
        return;
    }

    if (!args.length) {
        return message.channel.send("Veuillez saisir les émojis à créer.");
    }

    const emojiList = args.join(' ').match(/<a?:\w+:\d+>/g);
    if (!emojiList || emojiList.length === 0) {
        return message.channel.send("Aucun émoji valide trouvé. Veuillez saisir des émojis à créer.");
    }

    let createdEmojiCount = 0;

    for (const emoji of emojiList) {
        const emojiNameMatch = emoji.match(/:(\w+):/);
        const emojiIdMatch = emoji.match(/:(\d+)>/);

        if (emojiNameMatch && emojiIdMatch) {
            const emojiName = emojiNameMatch[1];
            const emojiId = emojiIdMatch[1];
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.png`;

            try {
                await message.guild.emojis.create({
                    attachment: emojiUrl,
                    name: emojiName
                });
                createdEmojiCount++;
            } catch (error) {
                console.error(`Erreur lors de la création de l'émoji ${emojiName}:`, error);
            }
        }
    }

    message.channel.send(`\`${createdEmojiCount}\` émoji(s) ont été créés.`);
};
