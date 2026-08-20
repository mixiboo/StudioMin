"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildBanRemove = handleGuildBanRemove;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleGuildBanRemove(ban) {
    try {
        const guildId = ban.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'memberUnban'))
            return;
        const logChannel = ban.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🔓 멤버 언밴')
            .setColor(0x00FF00)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields({ name: '유저', value: `${ban.user.tag} (${ban.user.id})`, inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling guildBanRemove:', error);
    }
}
