"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildMemberAdd = handleGuildMemberAdd;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
const database_1 = require("../services/database");
const localization_1 = require("../services/localization");
const embed_1 = require("../utils/embed");
async function handleGuildMemberAdd(member) {
    const guildId = member.guild.id;
    try {
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (config?.logChannel && (0, configManager_1.isEventEnabled)(guildId, 'memberJoin')) {
            const logChannel = member.guild.channels.cache.get(config.logChannel);
            if (logChannel) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle('📥 멤버 입장')
                    .setColor(0x00FF00)
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields({
                    name: '유저',
                    value: `${member.user.tag} (${member.user.id})`,
                    inline: true
                }, {
                    name: '계정 생성일',
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true
                }, {
                    name: '총 멤버 수',
                    value: member.guild.memberCount.toString(),
                    inline: true
                })
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }
        }
    }
    catch (error) {
        console.error('Error handling member join logger:', error);
    }
    try {
        const guildConfig = await database_1.db.guild.findUnique({
            where: { id: guildId },
        });
        if (!guildConfig)
            return;
        if (guildConfig.welcomeChannelId) {
            const channel = member.guild.channels.cache.get(guildConfig.welcomeChannelId);
            if (channel) {
                const message = (guildConfig.welcomeMessage || (0, localization_1.t)('events.member_join.default_message'))
                    .replace(/{user}/g, member.toString())
                    .replace(/{username}/g, member.user.username)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount.toString());
                const embed = (0, embed_1.createEmbed)('success')
                    .setTitle('Welcome! 🎉')
                    .setDescription(message)
                    .setThumbnail(member.user.displayAvatarURL());
                await channel.send({ embeds: [embed] });
            }
        }
        if (guildConfig.autoRoleId) {
            const role = member.guild.roles.cache.get(guildConfig.autoRoleId);
            if (role) {
                try {
                    await member.roles.add(role);
                }
                catch (error) {
                    console.error('Failed to assign auto role:', error);
                }
            }
        }
    }
    catch (error) {
        console.error('Error handling welcome system:', error);
    }
}
