import { Role, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 역할 업데이트 이벤트 핸들러
 */
export async function handleRoleUpdate(oldRole: Role, newRole: Role): Promise<void> {
    try {
        const guildId = newRole.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'roleUpdate')) return;
        
        const logChannel = newRole.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const changes: string[] = [];
        
        // 이름 변경
        if (oldRole.name !== newRole.name) {
            changes.push(`**이름**: ${oldRole.name} → ${newRole.name}`);
        }
        
        // 색상 변경
        if (oldRole.hexColor !== newRole.hexColor) {
            changes.push(`**색상**: ${oldRole.hexColor} → ${newRole.hexColor}`);
        }
        
        // 권한 변경
        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            changes.push(`**권한이 변경되었습니다**`);
        }
        
        if (changes.length === 0) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🎭 역할 업데이트')
            .setColor(newRole.color || 0x0099FF)
            .addFields(
                { name: '역할', value: `@${newRole.name}`, inline: true },
                { name: '변경 사항', value: changes.join('\n'), inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling roleUpdate:', error);
    }
}
