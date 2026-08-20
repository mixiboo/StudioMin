import { Sticker, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 스티커 삭제 이벤트 핸들러
 */
export async function handleStickerDelete(sticker: Sticker): Promise<void> {
    try {
        if (!sticker.guild) return;
        
        const guildId = sticker.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'stickerDelete')) return;
        
        const logChannel = sticker.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🗑️ 스티커 삭제')
            .setColor(0xFF0000)
            .addFields(
                { name: '스티커 이름', value: sticker.name, inline: true },
                { name: '스티커 ID', value: sticker.id, inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling stickerDelete:', error);
    }
}
