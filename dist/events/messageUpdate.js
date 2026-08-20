"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageUpdate = handleMessageUpdate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleMessageUpdate(oldMessage, newMessage) {
    try {
        if (!newMessage.guild)
            return;
        const guildId = newMessage.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'messageUpdate'))
            return;
        if (oldMessage.content === newMessage.content)
            return;
        const logChannel = newMessage.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('✏️ 메시지 수정')
            .setColor(0xFFA500)
            .addFields({ name: '작성자', value: newMessage.author ? `${newMessage.author.tag} (${newMessage.author.id})` : '알 수 없음', inline: true }, { name: '채널', value: `<#${newMessage.channel.id}>`, inline: true }, { name: '메시지 ID', value: newMessage.id, inline: true })
            .setTimestamp();
        if (oldMessage.content) {
            embed.addFields({ name: '수정 전', value: oldMessage.content.substring(0, 1024) || '내용 없음' });
        }
        if (newMessage.content) {
            embed.addFields({ name: '수정 후', value: newMessage.content.substring(0, 1024) || '내용 없음' });
        }
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling messageUpdate:', error);
    }
}
