"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChannelCreate = handleChannelCreate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleChannelCreate(channel) {
    try {
        const guildId = channel.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'channelCreate'))
            return;
        const logChannel = channel.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('📁 채널 생성')
            .setColor(0x00FF00)
            .addFields({ name: '채널 이름', value: channel.name, inline: true }, { name: '채널 타입', value: channel.type.toString(), inline: true }, { name: '채널 ID', value: channel.id, inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling channelCreate:', error);
    }
}
