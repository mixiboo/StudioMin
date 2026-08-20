import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { isEventEnabled, getGuildConfig } from '../utils/configManager';
import { db } from '../services/database';
import { t } from '../services/localization';
import { createEmbed } from '../utils/embed';

export async function handleGuildMemberAdd(member: GuildMember): Promise<void> {
    const guildId = member.guild.id;

    // =========================
    // 1. 감사 로그
    // =========================
    try {
        const config = getGuildConfig(guildId);

        if (config?.logChannel && isEventEnabled(guildId, 'memberJoin')) {
            const logChannel = member.guild.channels.cache.get(config.logChannel) as TextChannel;

            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('📥 멤버 입장')
                    .setColor(0x00FF00)
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields(
                        {
                            name: '유저',
                            value: `${member.user.tag} (${member.user.id})`,
                            inline: true
                        },
                        {
                            name: '계정 생성일',
                            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                            inline: true
                        },
                        {
                            name: '총 멤버 수',
                            value: member.guild.memberCount.toString(),
                            inline: true
                        }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error handling member join logger:', error);
    }

    // =========================
    // 2. 환영 / 자동 역할
    // =========================
    try {
        const guildConfig = await db.guild.findUnique({
            where: { id: guildId },
        });

        if (!guildConfig) return;

        // 환영 메시지
        if (guildConfig.welcomeChannelId) {
            const channel = member.guild.channels.cache.get(
                guildConfig.welcomeChannelId
            ) as TextChannel;

            if (channel) {
                const message = (guildConfig.welcomeMessage || t('events.member_join.default_message'))
                    .replace(/{user}/g, member.toString())
                    .replace(/{username}/g, member.user.username)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount.toString());

                const embed = createEmbed('success')
                    .setTitle('Welcome! 🎉')
                    .setDescription(message)
                    .setThumbnail(member.user.displayAvatarURL());

                await channel.send({ embeds: [embed] });
            }
        }

        // 자동 역할
        if (guildConfig.autoRoleId) {
            const role = member.guild.roles.cache.get(guildConfig.autoRoleId);

            if (role) {
                try {
                    await member.roles.add(role);
                } catch (error) {
                    console.error('Failed to assign auto role:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error handling welcome system:', error);
    }
}
