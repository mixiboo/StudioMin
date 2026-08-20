import { ReadonlyCollection, Message, EmbedBuilder, TextChannel, Snowflake, PartialMessage, GuildTextBasedChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 메시지 대량 삭제 이벤트 핸들러
 */
export async function handleMessageDeleteBulk(messages: ReadonlyCollection<Snowflake, Message | PartialMessage>, channel: GuildTextBasedChannel): Promise<void> {
    try {
        if (!channel.guild) return;
        
        const guildId = channel.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'messageDeleteBulk')) return;
        
        const logChannel = channel.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🗑️ 메시지 대량 삭제')
            .setColor(0xFF0000)
            .addFields(
                { name: '채널', value: `<#${channel.id}>`, inline: true },
                { name: '삭제된 메시지 수', value: messages.size.toString(), inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling messageDeleteBulk:', error);
    }
}
