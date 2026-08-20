import { VoiceState, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 음성 상태 업데이트 이벤트 핸들러
 */
export async function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    try {
        if (!newState.guild) return;
        
        const guildId = newState.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'voiceStateUpdate')) return;
        
        const logChannel = newState.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        let title = '';
        let color = 0x0099FF;
        let description = '';
        
        // 입장
        if (!oldState.channel && newState.channel) {
            title = '🎤 음성 채널 입장';
            color = 0x00FF00;
            description = `${newState.member?.user.tag}님이 <#${newState.channel.id}>에 입장했습니다.`;
        }
        // 퇴장
        else if (oldState.channel && !newState.channel) {
            title = '🔇 음성 채널 퇴장';
            color = 0xFF0000;
            description = `${newState.member?.user.tag}님이 <#${oldState.channel.id}>에서 퇴장했습니다.`;
        }
        // 이동
        else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            title = '🔄 음성 채널 이동';
            color = 0x0099FF;
            description = `${newState.member?.user.tag}님이 <#${oldState.channel.id}>에서 <#${newState.channel.id}>로 이동했습니다.`;
        } else {
            return; // 다른 상태 변경 (음소거 등)은 무시
        }
        
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(description)
            .addFields(
                { name: '유저', value: `${newState.member?.user.tag} (${newState.member?.user.id})`, inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling voiceStateUpdate:', error);
    }
}
