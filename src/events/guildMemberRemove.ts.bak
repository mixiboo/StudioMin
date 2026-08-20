import { GuildMember, EmbedBuilder, TextChannel, PartialGuildMember } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 멤버 퇴장 이벤트 핸들러
 */
export async function handleGuildMemberRemove(member: GuildMember | PartialGuildMember): Promise<void> {
    try {
        const guildId = member.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'memberLeave')) return;
        
        const logChannel = member.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('📤 멤버 퇴장')
            .setColor(0xFF0000)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '유저', value: `${member.user.tag} (${member.user.id})`, inline: true },
                { name: '총 멤버 수', value: member.guild.memberCount.toString(), inline: true }
            )
            .setTimestamp();
        
        if (member.joinedAt) {
            embed.addFields({ name: '가입 일자', value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`, inline: true });
        }
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling guildMemberRemove:', error);
    }
}
