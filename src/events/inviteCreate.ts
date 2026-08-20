import { Invite, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 초대 생성 이벤트 핸들러
 */
export async function handleInviteCreate(invite: Invite): Promise<void> {
    try {
        if (!invite.guild || !('channels' in invite.guild)) return;
        
        const guildId = invite.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'inviteCreate')) return;
        
        const logChannel = invite.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🔗 초대 링크 생성')
            .setColor(0x00FF00)
            .addFields(
                { name: '초대 코드', value: invite.code, inline: true },
                { name: '생성자', value: invite.inviter ? `${invite.inviter.tag}` : '알 수 없음', inline: true },
                { name: '채널', value: invite.channel ? `<#${invite.channel.id}>` : '알 수 없음', inline: true }
            )
            .setTimestamp();
        
        if (invite.maxAge) {
            const expiresIn = invite.maxAge === 0 ? '무제한' : `${invite.maxAge / 3600}시간`;
            embed.addFields({ name: '유효 기간', value: expiresIn, inline: true });
        }
        
        if (invite.maxUses) {
            const maxUses = invite.maxUses === 0 ? '무제한' : invite.maxUses.toString();
            embed.addFields({ name: '최대 사용 횟수', value: maxUses, inline: true });
        }
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling inviteCreate:', error);
    }
}
