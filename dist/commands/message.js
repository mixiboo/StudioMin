"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('message')
    .setNameLocalizations({ ko: '메시지' })
    .setDescription('관리자용 일반 메시지 전송')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addChannelOption(option => option.setName('channel').setNameLocalizations({ ko: '채널' }).setDescription('메시지를 보낼 채널').addChannelTypes(discord_js_1.ChannelType.GuildText).setRequired(true))
    .addStringOption(option => option.setName('content').setNameLocalizations({ ko: '내용' }).setDescription('전송할 메시지 내용').setMaxLength(2000).setRequired(true));
async function execute(interaction) {
    if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '관리자만 사용할 수 있는 명령어입니다.', ephemeral: true });
    }
    const channel = interaction.options.getChannel('channel', true);
    const content = interaction.options.getString('content', true);
    if (!(channel instanceof discord_js_1.TextChannel)) {
        return interaction.reply({ content: '텍스트 채널만 선택할 수 있습니다.', ephemeral: true });
    }
    try {
        await channel.send({ content });
        return interaction.reply({ content: `✅ ${channel}에 메시지를 전송했습니다.`, ephemeral: true });
    }
    catch (error) {
        console.error('[메시지] 전송 실패:', error);
        return interaction.reply({ content: '❌ 메시지를 전송하지 못했습니다. 봇의 채널 권한을 확인해주세요.', ephemeral: true });
    }
}
exports.execute = execute;
