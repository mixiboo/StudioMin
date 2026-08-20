"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoleDelete = handleRoleDelete;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleRoleDelete(role) {
    try {
        const guildId = role.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'roleDelete'))
            return;
        const logChannel = role.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🗑️ 역할 삭제')
            .setColor(0xFF0000)
            .addFields({ name: '역할 이름', value: role.name, inline: true }, { name: '역할 ID', value: role.id, inline: true }, { name: '색상', value: role.hexColor, inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling roleDelete:', error);
    }
}
