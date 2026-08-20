import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 멤버 입장 이벤트 핸들러
 */
export async function handleGuildMemberAdd(member: GuildMember): Promise<void> {
    try {
        const guildId = member.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'memberJoin')) return;
        
        const logChannel = member.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('📥 멤버 입장')
            .setColor(0x00FF00)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '유저', value: `${member.user.tag} (${member.user.id})`, inline: true },
                { name: '계정 생성일', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '총 멤버 수', value: member.guild.memberCount.toString(), inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling guildMemberAdd:', error);
    }
}
