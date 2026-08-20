"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStickerUpdate = handleStickerUpdate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleStickerUpdate(oldSticker, newSticker) {
    try {
        if (!newSticker.guild)
            return;
        const guildId = newSticker.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'stickerUpdate'))
            return;
        const logChannel = newSticker.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const changes = [];
        if (oldSticker.name !== newSticker.name) {
            changes.push(`**이름**: ${oldSticker.name} → ${newSticker.name}`);
        }
        if (oldSticker.description !== newSticker.description) {
            changes.push(`**설명**: ${oldSticker.description || '없음'} → ${newSticker.description || '없음'}`);
        }
        if (changes.length === 0)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🎨 스티커 수정')
            .setColor(0x0099FF)
            .addFields({ name: '스티커 ID', value: newSticker.id, inline: true }, { name: '변경 사항', value: changes.join('\n'), inline: false })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling stickerUpdate:', error);
    }
}
