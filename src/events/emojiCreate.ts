import { GuildEmoji, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 이모지 생성 이벤트 핸들러
 */
export async function handleEmojiCreate(emoji: GuildEmoji): Promise<void> {
    try {
        const guildId = emoji.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'emojiCreate')) return;
        
        const logChannel = emoji.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('😀 이모지 생성')
            .setColor(0x00FF00)
            .setThumbnail(emoji.imageURL())
            .addFields(
                { name: '이모지 이름', value: emoji.name || '알 수 없음', inline: true },
                { name: '이모지 ID', value: emoji.id, inline: true },
                { name: '애니메이션', value: emoji.animated ? '예' : '아니오', inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling emojiCreate:', error);
    }
}
