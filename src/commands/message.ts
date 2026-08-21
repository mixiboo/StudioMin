import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('메시지')
    .setDescription('관리자용 일반 메시지 전송')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
        option
            .setName('채널')
            .setDescription('메시지를 보낼 채널')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
    )
    .addStringOption(option =>
        option
            .setName('내용')
            .setDescription('전송할 메시지 내용')
            .setMaxLength(2000)
            .setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '관리자만 사용할 수 있는 명령어입니다.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('채널', true);
    const content = interaction.options.getString('내용', true);

    if (!(channel instanceof TextChannel)) {
        return interaction.reply({ content: '텍스트 채널만 선택할 수 있습니다.', ephemeral: true });
    }

    try {
        await channel.send({ content });
        return interaction.reply({ content: `✅ ${channel}에 메시지를 전송했습니다.`, ephemeral: true });
    } catch (error) {
        console.error('[메시지] 전송 실패:', error);
        return interaction.reply({
            content: '❌ 메시지를 전송하지 못했습니다. 봇의 채널 권한을 확인해주세요.',
            ephemeral: true,
        });
    }
}
