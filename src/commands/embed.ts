import {
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
} from 'discord.js';

function parseColor(value: string | null): number {
    if (!value) return 0x5865f2;

    const normalized = value.trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        throw new Error('색상은 6자리 HEX 형식이어야 합니다.');
    }

    return Number.parseInt(normalized, 16);
}

function isValidUrl(value: string | null): boolean {
    if (!value) return true;

    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export const data = new SlashCommandBuilder()
    .setName('임베드')
    .setDescription('관리자용 임베드 메시지 제작 및 전송')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
        option
            .setName('채널')
            .setDescription('임베드를 보낼 채널')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
    )
    .addStringOption(option =>
        option
            .setName('제목')
            .setDescription('임베드 제목')
            .setMaxLength(256)
            .setRequired(true),
    )
    .addStringOption(option =>
        option
            .setName('내용')
            .setDescription('임베드 설명')
            .setMaxLength(4096)
            .setRequired(true),
    )
    .addStringOption(option =>
        option
            .setName('색상')
            .setDescription('HEX 색상 (예: #5865F2)')
            .setMaxLength(7)
            .setRequired(false),
    )
    .addStringOption(option =>
        option
            .setName('썸네일')
            .setDescription('썸네일 이미지 URL')
            .setRequired(false),
    )
    .addStringOption(option =>
        option
            .setName('이미지')
            .setDescription('본문 이미지 URL')
            .setRequired(false),
    )
    .addStringOption(option =>
        option
            .setName('푸터')
            .setDescription('임베드 하단 문구')
            .setMaxLength(2048)
            .setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return '관리자만 사용할 수 있는 명령어입니다.';
    }

    const channel = interaction.options.getChannel('채널', true);
    const title = interaction.options.getString('제목', true);
    const description = interaction.options.getString('내용', true);
    const color = interaction.options.getString('색상');
    const thumbnail = interaction.options.getString('썸네일');
    const image = interaction.options.getString('이미지');
    const footer = interaction.options.getString('푸터');

    if (!(channel instanceof TextChannel)) {
        return '텍스트 채널만 선택할 수 있습니다.';
    }

    if (!isValidUrl(thumbnail) || !isValidUrl(image)) {
        return '❌ 썸네일/이미지는 http 또는 https URL만 사용할 수 있습니다.';
    }

    let parsedColor: number;
    try {
        parsedColor = parseColor(color);
    } catch {
        return '❌ 색상은 `#5865F2` 같은 6자리 HEX 형식으로 입력해주세요.';
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(parsedColor);

    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (footer) embed.setFooter({ text: footer });

    try {
        await channel.send({ embeds: [embed] });
        return `✅ ${channel}에 임베드를 전송했습니다.`;
    } catch (error) {
        console.error('[임베드] 전송 실패:', error);
        return '❌ 임베드를 전송하지 못했습니다. 봇의 채널 권한과 이미지 URL을 확인해주세요.';
    }
}
