import { Message, EmbedBuilder, TextChannel, PartialMessage } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 메시지 수정 이벤트 핸들러
 */
export async function handleMessageUpdate(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void> {
    try {
        if (!newMessage.guild) return;
        
        const guildId = newMessage.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'messageUpdate')) return;
        
        // 내용이 변경되지 않은 경우 무시 (임베드 등)
        if (oldMessage.content === newMessage.content) return;
        
        const logChannel = newMessage.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('✏️ 메시지 수정')
            .setColor(0xFFA500)
            .addFields(
                { name: '작성자', value: newMessage.author ? `${newMessage.author.tag} (${newMessage.author.id})` : '알 수 없음', inline: true },
                { name: '채널', value: `<#${newMessage.channel.id}>`, inline: true },
                { name: '메시지 ID', value: newMessage.id, inline: true }
            )
            .setTimestamp();
        
        if (oldMessage.content) {
            embed.addFields({ name: '수정 전', value: oldMessage.content.substring(0, 1024) || '내용 없음' });
        }
        
        if (newMessage.content) {
            embed.addFields({ name: '수정 후', value: newMessage.content.substring(0, 1024) || '내용 없음' });
        }
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling messageUpdate:', error);
    }
}
