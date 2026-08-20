import { GuildBan, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';

/**
 * 멤버 언밴 이벤트 핸들러
 */
export async function handleGuildBanRemove(ban: GuildBan): Promise<void> {
    try {
        const guildId = ban.guild.id;
        const config = getGuildConfig(guildId);
        
        if (!config?.logChannel || !isEventEnabled(guildId, 'memberUnban')) return;
        
        const logChannel = ban.guild.channels.cache.get(config.logChannel) as TextChannel;
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🔓 멤버 언밴')
            .setColor(0x00FF00)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: '유저', value: `${ban.user.tag} (${ban.user.id})`, inline: true }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling guildBanRemove:', error);
    }
}
