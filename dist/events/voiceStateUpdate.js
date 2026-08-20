"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVoiceStateUpdate = handleVoiceStateUpdate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleVoiceStateUpdate(oldState, newState) {
    try {
        if (!newState.guild)
            return;
        const guildId = newState.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'voiceStateUpdate'))
            return;
        const logChannel = newState.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        let title = '';
        let color = 0x0099FF;
        let description = '';
        if (!oldState.channel && newState.channel) {
            title = '🎤 음성 채널 입장';
            color = 0x00FF00;
            description = `${newState.member?.user.tag}님이 <#${newState.channel.id}>에 입장했습니다.`;
        }
        else if (oldState.channel && !newState.channel) {
            title = '🔇 음성 채널 퇴장';
            color = 0xFF0000;
            description = `${newState.member?.user.tag}님이 <#${oldState.channel.id}>에서 퇴장했습니다.`;
        }
        else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            title = '🔄 음성 채널 이동';
            color = 0x0099FF;
            description = `${newState.member?.user.tag}님이 <#${oldState.channel.id}>에서 <#${newState.channel.id}>로 이동했습니다.`;
        }
        else {
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(description)
            .addFields({ name: '유저', value: `${newState.member?.user.tag} (${newState.member?.user.id})`, inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling voiceStateUpdate:', error);
    }
}
