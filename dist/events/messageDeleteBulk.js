"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageDeleteBulk = handleMessageDeleteBulk;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleMessageDeleteBulk(messages, channel) {
    try {
        if (!channel.guild)
            return;
        const guildId = channel.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'messageDeleteBulk'))
            return;
        const logChannel = channel.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🗑️ 메시지 대량 삭제')
            .setColor(0xFF0000)
            .addFields({ name: '채널', value: `<#${channel.id}>`, inline: true }, { name: '삭제된 메시지 수', value: messages.size.toString(), inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling messageDeleteBulk:', error);
    }
}
