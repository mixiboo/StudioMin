import { GuildChannel, EmbedBuilder, TextChannel, DMChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 채널 업데이트 이벤트 핸들러
 */
export async function handleChannelUpdate(oldChannel: GuildChannel | DMChannel, newChannel: GuildChannel | DMChannel): Promise<void> {
    try {
        if (oldChannel.isDMBased() || newChannel.isDMBased()) return;
        
        const guildId = newChannel.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'channelUpdate')) return;
        
        const logChannel = newChannel.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const changes: string[] = [];
        
        // 이름 변경
        if (oldChannel.name !== newChannel.name) {
            changes.push(`**이름**: ${oldChannel.name} → ${newChannel.name}`);
        }
        
        // 토픽 변경 (텍스트 채널인 경우)
        if (oldChannel.isTextBased() && newChannel.isTextBased()) {
            const oldTopic = (oldChannel as TextChannel).topic;
            const newTopic = (newChannel as TextChannel).topic;
            if (oldTopic !== newTopic) {
                changes.push(`**토픽**: ${oldTopic || '없음'} → ${newTopic || '없음'}`);
            }
        }
        
        if (changes.length === 0) return;
        
        const embed = new EmbedBuilder()
            .setTitle('📝 채널 업데이트')
            .setColor(0x0099FF)
            .addFields(
                { name: '채널', value: `<#${newChannel.id}>`, inline: true },
                { name: '변경 사항', value: changes.join('\n'), inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling channelUpdate:', error);
    }
}
