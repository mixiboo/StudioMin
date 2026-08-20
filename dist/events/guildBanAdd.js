"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildBanAdd = handleGuildBanAdd;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleGuildBanAdd(ban) {
    try {
        const guildId = ban.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'memberBan'))
            return;
        const logChannel = ban.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🔨 멤버 밴')
            .setColor(0xFF0000)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields({ name: '유저', value: `${ban.user.tag} (${ban.user.id})`, inline: true })
            .setTimestamp();
        if (ban.reason) {
            embed.addFields({ name: '사유', value: ban.reason, inline: false });
        }
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling guildBanAdd:', error);
    }
}
