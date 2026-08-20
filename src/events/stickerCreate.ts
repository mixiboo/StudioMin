import { Sticker, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 스티커 생성 이벤트 핸들러
 */
export async function handleStickerCreate(sticker: Sticker): Promise<void> {
    try {
        if (!sticker.guild) return;
        
        const guildId = sticker.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'stickerCreate')) return;
        
        const logChannel = sticker.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🎨 스티커 생성')
            .setColor(0x00FF00)
            .addFields(
                { name: '스티커 이름', value: sticker.name, inline: true },
                { name: '스티커 ID', value: sticker.id, inline: true },
                { name: '설명', value: sticker.description || '없음', inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling stickerCreate:', error);
    }
}
