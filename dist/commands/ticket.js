"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
exports.closeTicket = closeTicket;
const discord_js_1 = require("discord.js");
const ticketSystem_1 = require("../utils/ticketSystem");
const fs_1 = require("fs");
const path_1 = require("path");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('ticket')
    .setNameLocalization('ko', '티켓')
    .setDescription('Ticket management commands.')
    .setDescriptionLocalization('ko', '티켓 관리 명령어')
    .addSubcommand(subcommand => subcommand
    .setName('close')
    .setNameLocalization('ko', '닫기')
    .setDescription('Close the current ticket.')
    .setDescriptionLocalization('ko', '현재 티켓을 닫습니다.'));
async function execute(interaction) {
    if (!interaction.guild) {
        await interaction.reply({ content: '이 명령어는 서버에서만 사용할 수 있습니다.', ephemeral: true });
        return;
    }
    if (interaction.options.getSubcommand() === 'close')
        await handleClose(interaction);
}
async function handleClose(interaction) {
    if (!interaction.guild || !interaction.channel) {
        await interaction.reply({ content: '이 명령어는 서버의 티켓 채널에서만 사용할 수 있습니다.', ephemeral: true });
        return;
    }
    const ticket = ticketSystem_1.ticketSystem.getTicketByChannel(interaction.guild.id, interaction.channel.id);
    if (!ticket) {
        await interaction.reply({ content: '이 채널은 티켓 채널이 아닙니다.', ephemeral: true });
        return;
    }
    await closeTicket(interaction);
}
async function closeTicket(interaction) {
    if (!interaction.guild || !interaction.channel)
        return;
    const setup = ticketSystem_1.ticketSystem.getSetup(interaction.guild.id);
    if (!setup) {
        if (!interaction.replied && !interaction.deferred)
            await interaction.reply({ content: '티켓 시스템이 설정되지 않았습니다.', ephemeral: true });
        else
            await interaction.editReply('티켓 시스템이 설정되지 않았습니다.');
        return;
    }
    if (!interaction.replied && !interaction.deferred)
        await interaction.reply('⏳ 5초 뒤 티켓이 종료됩니다...');
    else
        await interaction.editReply('⏳ 5초 뒤 티켓이 종료됩니다...');
    const logChannel = await interaction.guild.channels.fetch(setup.logChannel);
    if (logChannel && logChannel.type === discord_js_1.ChannelType.GuildText) {
        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const sortedMessages = Array.from(messages.values());
            sortedMessages.reverse();
            const channelName = interaction.channel.type === discord_js_1.ChannelType.GuildText ? interaction.channel.name : 'Unknown';
            let logText = `티켓 채널: ${channelName}\n`;
            logText += `종료 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n`;
            logText += '='.repeat(50) + '\n\n';
            for (const message of sortedMessages) {
                const timestamp = message.createdAt.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
                const content = message.content || '[임베드 또는 첨부 파일]';
                logText += `[${timestamp}] ${message.author.tag}: ${content}\n`;
                message.attachments.forEach((attachment) => { logText += `  └ 첨부: ${attachment.url}\n`; });
            }
            const tmpDir = path_1.default.join(process.cwd(), 'tmp');
            if (!fs_1.default.existsSync(tmpDir))
                fs_1.default.mkdirSync(tmpDir, { recursive: true });
            const filePath = path_1.default.join(tmpDir, `ticket-log-${interaction.channel.id}.txt`);
            fs_1.default.writeFileSync(filePath, logText, 'utf-8');
            const logEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('📋 티켓 종료')
                .setDescription(`티켓 **${channelName}**이(가) 종료되었습니다.`)
                .addFields({ name: '종료자', value: `<@${interaction.user.id}>`, inline: true }, { name: '종료 시간', value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: true })
                .setColor(0xFF0000)
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed], files: [new discord_js_1.AttachmentBuilder(filePath)] });
            fs_1.default.unlinkSync(filePath);
        }
        catch (error) {
            console.error('Error saving ticket log:', error);
        }
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
    ticketSystem_1.ticketSystem.closeTicket(interaction.guild.id, interaction.channel.id);
    if (interaction.channel.type === discord_js_1.ChannelType.GuildText)
        await interaction.channel.delete('티켓 종료');
}
