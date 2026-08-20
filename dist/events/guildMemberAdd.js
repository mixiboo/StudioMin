"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildMemberAdd = handleGuildMemberAdd;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleGuildMemberAdd(member) {
    try {
        const guildId = member.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'memberJoin'))
            return;
        const logChannel = member.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('📥 멤버 입장')
            .setColor(0x00FF00)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({ name: '유저', value: `${member.user.tag} (${member.user.id})`, inline: true }, { name: '계정 생성일', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }, { name: '총 멤버 수', value: member.guild.memberCount.toString(), inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling guildMemberAdd:', error);
    }
}
