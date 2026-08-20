import { Sticker, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 스티커 수정 이벤트 핸들러
 */
export async function handleStickerUpdate(oldSticker: Sticker, newSticker: Sticker): Promise<void> {
    try {
        if (!newSticker.guild) return;
        
        const guildId = newSticker.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'stickerUpdate')) return;
        
        const logChannel = newSticker.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const changes: string[] = [];
        
        if (oldSticker.name !== newSticker.name) {
            changes.push(`**이름**: ${oldSticker.name} → ${newSticker.name}`);
        }
        
        if (oldSticker.description !== newSticker.description) {
            changes.push(`**설명**: ${oldSticker.description || '없음'} → ${newSticker.description || '없음'}`);
        }
        
        if (changes.length === 0) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🎨 스티커 수정')
            .setColor(0x0099FF)
            .addFields(
                { name: '스티커 ID', value: newSticker.id, inline: true },
                { name: '변경 사항', value: changes.join('\n'), inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling stickerUpdate:', error);
    }
}
