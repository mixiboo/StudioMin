import { GuildBan, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 멤버 밴 이벤트 핸들러
 */
export async function handleGuildBanAdd(ban: GuildBan): Promise<void> {
    try {
        const guildId = ban.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'memberBan')) return;
        
        const logChannel = ban.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🔨 멤버 밴')
            .setColor(0xFF0000)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: '유저', value: `${ban.user.tag} (${ban.user.id})`, inline: true }
            )
            .setTimestamp();
        
        if (ban.reason) {
            embed.addFields({ name: '사유', value: ban.reason, inline: false });
        }
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling guildBanAdd:', error);
    }
}
