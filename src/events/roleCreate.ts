import { Role, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 역할 생성 이벤트 핸들러
 */
export async function handleRoleCreate(role: Role): Promise<void> {
    try {
        const guildId = role.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'roleCreate')) return;
        
        const logChannel = role.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🎭 역할 생성')
            .setColor(role.color || 0x00FF00)
            .addFields(
                { name: '역할 이름', value: role.name, inline: true },
                { name: '역할 ID', value: role.id, inline: true },
                { name: '색상', value: role.hexColor, inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling roleCreate:', error);
    }
}
