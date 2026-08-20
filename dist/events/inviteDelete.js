"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInviteDelete = handleInviteDelete;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleInviteDelete(invite) {
    try {
        if (!invite.guild || !('channels' in invite.guild))
            return;
        const guildId = invite.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'inviteDelete'))
            return;
        const logChannel = invite.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🗑️ 초대 링크 삭제')
            .setColor(0xFF0000)
            .addFields({ name: '초대 코드', value: invite.code, inline: true }, { name: '채널', value: invite.channel ? `<#${invite.channel.id}>` : '알 수 없음', inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling inviteDelete:', error);
    }
}
