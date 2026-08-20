import { Invite, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 초대 삭제 이벤트 핸들러
 */
export async function handleInviteDelete(invite: Invite): Promise<void> {
    try {
        if (!invite.guild || !('channels' in invite.guild)) return;
        
        const guildId = invite.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'inviteDelete')) return;
        
        const logChannel = invite.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🗑️ 초대 링크 삭제')
            .setColor(0xFF0000)
            .addFields(
                { name: '초대 코드', value: invite.code, inline: true },
                { name: '채널', value: invite.channel ? `<#${invite.channel.id}>` : '알 수 없음', inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling inviteDelete:', error);
    }
}
