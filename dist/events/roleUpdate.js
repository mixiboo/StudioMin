"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoleUpdate = handleRoleUpdate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleRoleUpdate(oldRole, newRole) {
    try {
        const guildId = newRole.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'roleUpdate'))
            return;
        const logChannel = newRole.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const changes = [];
        if (oldRole.name !== newRole.name) {
            changes.push(`**이름**: ${oldRole.name} → ${newRole.name}`);
        }
        if (oldRole.hexColor !== newRole.hexColor) {
            changes.push(`**색상**: ${oldRole.hexColor} → ${newRole.hexColor}`);
        }
        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            changes.push(`**권한이 변경되었습니다**`);
        }
        if (changes.length === 0)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🎭 역할 업데이트')
            .setColor(newRole.color || 0x0099FF)
            .addFields({ name: '역할', value: `@${newRole.name}`, inline: true }, { name: '변경 사항', value: changes.join('\n'), inline: false })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling roleUpdate:', error);
    }
}
