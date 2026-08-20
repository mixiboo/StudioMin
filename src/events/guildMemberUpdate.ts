import { GuildMember, EmbedBuilder, TextChannel, PartialGuildMember } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 멤버 업데이트 이벤트 핸들러
 */
export async function handleGuildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> {
    try {
        const guildId = newMember.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'memberUpdate')) return;
        
        const logChannel = newMember.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const changes: string[] = [];
        
        // 닉네임 변경 확인
        if (oldMember.nickname !== newMember.nickname) {
            changes.push(`**닉네임**: ${oldMember.nickname || '없음'} → ${newMember.nickname || '없음'}`);
        }
        
        // 역할 변경 확인
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
        
        if (addedRoles.size > 0) {
            changes.push(`**역할 추가**: ${addedRoles.map(r => r.name).join(', ')}`);
        }
        
        if (removedRoles.size > 0) {
            changes.push(`**역할 제거**: ${removedRoles.map(r => r.name).join(', ')}`);
        }
        
        if (changes.length === 0) return;
        
        const embed = new EmbedBuilder()
            .setTitle('👤 멤버 업데이트')
            .setColor(0x0099FF)
            .setThumbnail(newMember.user.displayAvatarURL())
            .addFields(
                { name: '유저', value: `${newMember.user.tag} (${newMember.user.id})`, inline: false },
                { name: '변경 사항', value: changes.join('\n'), inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling guildMemberUpdate:', error);
    }
}
