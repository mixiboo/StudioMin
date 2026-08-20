import { GuildChannel, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 채널 생성 이벤트 핸들러
 */
export async function handleChannelCreate(channel: GuildChannel): Promise<void> {
    try {
        const guildId = channel.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'channelCreate')) return;
        
        const logChannel = channel.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('📁 채널 생성')
            .setColor(0x00FF00)
            .addFields(
                { name: '채널 이름', value: channel.name, inline: true },
                { name: '채널 타입', value: channel.type.toString(), inline: true },
                { name: '채널 ID', value: channel.id, inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling channelCreate:', error);
    }
}
