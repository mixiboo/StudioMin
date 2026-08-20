import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { setLogChannel, setEventToggle, getGuildConfig } from '../utils/configManager';

// 이벤트 선택지 정의
const EVENT_CHOICES = [
    { name: '메시지 삭제 (messageDelete)', value: 'messageDelete' },
    { name: '메시지 수정 (messageUpdate)', value: 'messageUpdate' },
    { name: '메시지 대량 삭제 (messageDeleteBulk)', value: 'messageDeleteBulk' },
    { name: '멤버 입장 (memberJoin)', value: 'memberJoin' },
    { name: '멤버 퇴장 (memberLeave)', value: 'memberLeave' },
    { name: '멤버 업데이트 (memberUpdate)', value: 'memberUpdate' },
    { name: '멤버 밴 (memberBan)', value: 'memberBan' },
    { name: '멤버 언밴 (memberUnban)', value: 'memberUnban' },
    { name: '채널 생성 (channelCreate)', value: 'channelCreate' },
    { name: '채널 삭제 (channelDelete)', value: 'channelDelete' },
    { name: '채널 업데이트 (channelUpdate)', value: 'channelUpdate' },
    { name: '역할 생성 (roleCreate)', value: 'roleCreate' },
    { name: '역할 삭제 (roleDelete)', value: 'roleDelete' },
    { name: '역할 업데이트 (roleUpdate)', value: 'roleUpdate' },
    { name: '음성 상태 변경 (voiceStateUpdate)', value: 'voiceStateUpdate' },
    { name: '초대 생성 (inviteCreate)', value: 'inviteCreate' },
    { name: '초대 삭제 (inviteDelete)', value: 'inviteDelete' },
    { name: '이모지 생성 (emojiCreate)', value: 'emojiCreate' },
    { name: '이모지 삭제 (emojiDelete)', value: 'emojiDelete' },
    { name: '이모지 수정 (emojiUpdate)', value: 'emojiUpdate' },
    { name: '스티커 생성 (stickerCreate)', value: 'stickerCreate' },
    { name: '스티커 삭제 (stickerDelete)', value: 'stickerDelete' },
    { name: '스티커 수정 (stickerUpdate)', value: 'stickerUpdate' },
];

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('로그-설정')
    .setDescription('로그 설정 관리')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
        subcommand
            .setName('채널')
            .setDescription('로그를 보낼 채널을 설정합니다')
            .addChannelOption(option =>
                option
                    .setName('채널')
                    .setDescription('로그 채널')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('켜기')
            .setDescription('특정 이벤트 로깅을 활성화합니다')
            .addStringOption(option => {
                option
                    .setName('이벤트')
                    .setDescription('활성화할 이벤트')
                    .setRequired(true);
                
                EVENT_CHOICES.forEach(choice => {
                    option.addChoices(choice);
                });
                
                return option;
            })
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('끄기')
            .setDescription('특정 이벤트 로깅을 비활성화합니다')
            .addStringOption(option => {
                option
                    .setName('이벤트')
                    .setDescription('비활성화할 이벤트')
                    .setRequired(true);
                
                EVENT_CHOICES.forEach(choice => {
                    option.addChoices(choice);
                });
                
                return option;
            })
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('확인')
            .setDescription('현재 로그 설정을 확인합니다')
    );

/**
 * 로그 설정 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        return interaction.reply({
            content: '이 명령어는 서버에서만 사용할 수 있습니다.',
            ephemeral: true
        });
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case '채널': {
            const channel = interaction.options.getChannel('채널', true);
            
            setLogChannel(interaction.guildId, channel.id);
            
            return interaction.reply({
                content: `✅ 로그 채널이 <#${channel.id}>로 설정되었습니다.`,
                ephemeral: true
            });
        }

        case '켜기': {
            const eventName = interaction.options.getString('이벤트', true);
            
            setEventToggle(interaction.guildId, eventName as any, true);
            
            const eventLabel = EVENT_CHOICES.find(c => c.value === eventName)?.name || eventName;
            return interaction.reply({
                content: `✅ ${eventLabel} 로깅이 활성화되었습니다.`,
                ephemeral: true
            });
        }

        case '끄기': {
            const eventName = interaction.options.getString('이벤트', true);
            
            setEventToggle(interaction.guildId, eventName as any, false);
            
            const eventLabel = EVENT_CHOICES.find(c => c.value === eventName)?.name || eventName;
            return interaction.reply({
                content: `✅ ${eventLabel} 로깅이 비활성화되었습니다.`,
                ephemeral: true
            });
        }

        case '확인': {
            const config = getGuildConfig(interaction.guildId);
            
            if (!config) {
                return interaction.reply({
                    content: '아직 로그 설정이 없습니다. `/로그-설정 채널` 명령어로 먼저 로그 채널을 설정해주세요.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📊 로그 설정')
                .setColor(0x5865F2);

            if (config.logChannel) {
                embed.addFields({
                    name: '로그 채널',
                    value: `<#${config.logChannel}>`,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '로그 채널',
                    value: '설정되지 않음',
                    inline: false
                });
            }

            // 활성화된 이벤트와 비활성화된 이벤트 분리
            const enabledEvents: string[] = [];
            const disabledEvents: string[] = [];

            EVENT_CHOICES.forEach(choice => {
                const eventKey = choice.value as keyof typeof config.toggles;
                if (config.toggles[eventKey]) {
                    enabledEvents.push(choice.name);
                } else {
                    disabledEvents.push(choice.name);
                }
            });

            if (enabledEvents.length > 0) {
                embed.addFields({
                    name: '✅ 활성화된 이벤트',
                    value: enabledEvents.join('\n'),
                    inline: false
                });
            }

            if (disabledEvents.length > 0) {
                embed.addFields({
                    name: '❌ 비활성화된 이벤트',
                    value: disabledEvents.join('\n'),
                    inline: false
                });
            }

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        default:
            return interaction.reply({
                content: '알 수 없는 서브커맨드입니다.',
                ephemeral: true
            });
    }
}
