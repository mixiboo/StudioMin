import {
    GuildMember,
    PartialGuildMember,
    EmbedBuilder,
    TextChannel,
} from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';
import { db } from '../services/database';
import { t } from '../services/localization';
import { createEmbed } from '../utils/embed';

export async function handleGuildMemberRemove(
    member: GuildMember | PartialGuildMember
): Promise<void> {
    const guildId = member.guild.id;

    // =========================
    // 1. 감사 로그
    // =========================
    try {
        const config = getGuildConfig(guildId);

        if (config?.logChannel && isEventEnabled(guildId, 'memberLeave')) {
            const logChannel = member.guild.channels.cache.get(
                config.logChannel
            ) as TextChannel;

            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('📤 멤버 퇴장')
                    .setColor(0xFF0000)
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields(
                        {
                            name: '유저',
                            value: `${member.user.tag} (${member.user.id})`,
                            inline: true
                        },
                        {
                            name: '총 멤버 수',
                            value: member.guild.memberCount.toString(),
                            inline: true
                        }
                    )
                    .setTimestamp();

                if (member.joinedTimestamp) {
                    embed.addFields({
                        name: '가입 일자',
                        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                        inline: true
                    });
                }

                await logChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error handling member leave logger:', error);
    }

    // =========================
    // 2. 퇴장 메시지
    // =========================
    try {
        const guildConfig = await db.guild.findUnique({
            where: { id: guildId },
        });

        if (!guildConfig?.leaveChannelId) return;

        const channel = member.guild.channels.cache.get(
            guildConfig.leaveChannelId
        ) as TextChannel;

        if (!channel) return;

        const message = (guildConfig.leaveMessage || '{user} has left the server.')
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount.toString());

        const embed = createEmbed('error')
            .setTitle('👋 멤버 퇴장')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL());

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error handling leave system:', error);
    }
}
