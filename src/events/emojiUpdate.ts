import { GuildEmoji, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 이모지 수정 이벤트 핸들러
 */
export async function handleEmojiUpdate(oldEmoji: GuildEmoji, newEmoji: GuildEmoji): Promise<void> {
    try {
        const guildId = newEmoji.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'emojiUpdate')) return;
        
        const logChannel = newEmoji.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const changes: string[] = [];
        
        if (oldEmoji.name !== newEmoji.name) {
            changes.push(`**이름**: ${oldEmoji.name} → ${newEmoji.name}`);
        }
        
        if (changes.length === 0) return;
        
        const embed = new EmbedBuilder()
            .setTitle('😀 이모지 수정')
            .setColor(0x0099FF)
            .setThumbnail(newEmoji.imageURL())
            .addFields(
                { name: '이모지 ID', value: newEmoji.id, inline: true },
                { name: '변경 사항', value: changes.join('\n'), inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling emojiUpdate:', error);
    }
}
