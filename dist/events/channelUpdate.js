"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChannelUpdate = handleChannelUpdate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleChannelUpdate(oldChannel, newChannel) {
    try {
        if (oldChannel.isDMBased() || newChannel.isDMBased())
            return;
        const guildId = newChannel.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'channelUpdate'))
            return;
        const logChannel = newChannel.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const changes = [];
        if (oldChannel.name !== newChannel.name) {
            changes.push(`**이름**: ${oldChannel.name} → ${newChannel.name}`);
        }
        if (oldChannel.isTextBased() && newChannel.isTextBased()) {
            const oldTopic = oldChannel.topic;
            const newTopic = newChannel.topic;
            if (oldTopic !== newTopic) {
                changes.push(`**토픽**: ${oldTopic || '없음'} → ${newTopic || '없음'}`);
            }
        }
        if (changes.length === 0)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('📝 채널 업데이트')
            .setColor(0x0099FF)
            .addFields({ name: '채널', value: `<#${newChannel.id}>`, inline: true }, { name: '변경 사항', value: changes.join('\n'), inline: false })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling channelUpdate:', error);
    }
}
