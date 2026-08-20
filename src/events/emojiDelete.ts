import { GuildEmoji, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 이모지 삭제 이벤트 핸들러
 */
export async function handleEmojiDelete(emoji: GuildEmoji): Promise<void> {
    try {
        const guildId = emoji.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'emojiDelete')) return;
        
        const logChannel = emoji.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🗑️ 이모지 삭제')
            .setColor(0xFF0000)
            .setThumbnail(emoji.imageURL())
            .addFields(
                { name: '이모지 이름', value: emoji.name || '알 수 없음', inline: true },
                { name: '이모지 ID', value: emoji.id, inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling emojiDelete:', error);
    }
}
