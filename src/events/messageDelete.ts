import { Message, EmbedBuilder, TextChannel, PartialMessage } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 메시지 삭제 이벤트 핸들러
 */
export async function handleMessageDelete(message: Message | PartialMessage): Promise<void> {
    try {
        if (!message.guild) return;
        
        const guildId = message.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'messageDelete')) return;
        
        const logChannel = message.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🗑️ 메시지 삭제')
            .setColor(0xFF0000)
            .addFields(
                { name: '작성자', value: message.author ? `${message.author.tag} (${message.author.id})` : '알 수 없음', inline: true },
                { name: '채널', value: `<#${message.channel.id}>`, inline: true },
                { name: '메시지 ID', value: message.id, inline: true }
            )
            .setTimestamp();
        
        if (message.content) {
            embed.addFields({ name: '내용', value: message.content.substring(0, 1024) || '내용 없음' });
        }
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling messageDelete:', error);
    }
}
