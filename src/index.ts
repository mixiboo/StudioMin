import { Client, Events, Partials } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { startScheduledJobs } from "./scheduler";
import { handleMessageReactionAdd } from "./events/messageReactionAdd";
import { handleMessageReactionRemove } from "./events/messageReactionRemove";

// Event handlers
import { handleMessageCreate } from "./events/messageCreate";
import { handleMessageDelete } from "./events/messageDelete";
import { handleMessageUpdate } from "./events/messageUpdate";
import { handleMessageDeleteBulk } from "./events/messageDeleteBulk";
import { handleGuildMemberAdd } from "./events/guildMemberAdd";
import { handleGuildMemberRemove } from "./events/guildMemberRemove";
import { handleGuildMemberUpdate } from "./events/guildMemberUpdate";
import { handleGuildBanAdd } from "./events/guildBanAdd";
import { handleGuildBanRemove } from "./events/guildBanRemove";
import { handleChannelCreate } from "./events/channelCreate";
import { handleChannelDelete } from "./events/channelDelete";
import { handleChannelUpdate } from "./events/channelUpdate";
import { handleRoleCreate } from "./events/roleCreate";
import { handleRoleDelete } from "./events/roleDelete";
import { handleRoleUpdate } from "./events/roleUpdate";
import { handleVoiceStateUpdate } from "./events/voiceStateUpdate";
import { handleInviteCreate } from "./events/inviteCreate";
import { handleInviteDelete } from "./events/inviteDelete";
import { handleEmojiCreate } from "./events/emojiCreate";
import { handleEmojiDelete } from "./events/emojiDelete";
import { handleEmojiUpdate } from "./events/emojiUpdate";
import { handleStickerCreate } from "./events/stickerCreate";
import { handleStickerDelete } from "./events/stickerDelete";
import { handleStickerUpdate } from "./events/stickerUpdate";

// 클라이언트 생성 (모든 Partials 활성화)
const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "DirectMessages",
        "GuildMembers",
        "GuildVoiceStates",
        "GuildMessageReactions",
        "GuildEmojisAndStickers",
        "GuildIntegrations",
        "GuildWebhooks",
        "GuildInvites",
        "GuildPresences",
        "GuildBans",
        "GuildModeration",
        "MessageContent"
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.ThreadMember,
        Partials.GuildScheduledEvent
    ]
});

// 봇이 준비되었을 때의 이벤트 핸들러
client.once(Events.ClientReady, () => {
    console.log(`Discord bot is ready! 🤖`);
    console.log(`Logged in as ${client.user!.tag}!`);

    // 활동 상태 설정
    client.user?.setActivity('Activity', { type: 3 }); // 3: Watching

    // 명령어 갱신
    console.log("Started refreshing application (/) commands.");
    deployCommands();
    console.log("Successfully reloaded application (/) commands.");

    // 스케줄러 시작
    startScheduledJobs(client);
    console.log("스케줄러가 시작되었습니다.");
});

// 인터랙션 핸들러
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // 슬래시 커맨드 체크
        if (!interaction.isChatInputCommand()) return;

        const command = commands[interaction.commandName as keyof typeof commands];
        if (!command) return;

        // 옵션 처리를 포함한 명령어 실행
        await command.execute(interaction).catch(async (error) => {
            console.error(`Error executing command ${interaction.commandName}:`, error);

            // 이미 응답된 경우 followUp 사용
            const replyMethod = interaction.replied ? 'followUp' : 'reply';
            await interaction[replyMethod]({
                content: '명령어 실행 중 오류가 발생했습니다.',
                ephemeral: true
            });
        });

    } catch (error) {
        console.error('Error handling interaction:', error);
    }
});

// 이벤트 리스너
client.on(Events.MessageCreate, handleMessageCreate);
client.on(Events.MessageDelete, handleMessageDelete);
client.on(Events.MessageUpdate, handleMessageUpdate);
client.on(Events.MessageBulkDelete, handleMessageDeleteBulk);
client.on(Events.GuildMemberAdd, handleGuildMemberAdd);
client.on(Events.GuildMemberRemove, handleGuildMemberRemove);
client.on(Events.GuildMemberUpdate, handleGuildMemberUpdate);
client.on(Events.GuildBanAdd, handleGuildBanAdd);
client.on(Events.GuildBanRemove, handleGuildBanRemove);
client.on(Events.ChannelCreate, handleChannelCreate);
client.on(Events.ChannelDelete, handleChannelDelete);
client.on(Events.ChannelUpdate, handleChannelUpdate);
client.on(Events.GuildRoleCreate, handleRoleCreate);
client.on(Events.GuildRoleDelete, handleRoleDelete);
client.on(Events.GuildRoleUpdate, handleRoleUpdate);
client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);
client.on(Events.InviteCreate, handleInviteCreate);
client.on(Events.InviteDelete, handleInviteDelete);
client.on(Events.GuildEmojiCreate, handleEmojiCreate);
client.on(Events.GuildEmojiDelete, handleEmojiDelete);
client.on(Events.GuildEmojiUpdate, handleEmojiUpdate);
client.on(Events.GuildStickerCreate, handleStickerCreate);
client.on(Events.GuildStickerDelete, handleStickerDelete);
client.on(Events.GuildStickerUpdate, handleStickerUpdate);
client.on(Events.MessageCreate, handleMessageCreate);
client.on(Events.MessageDelete, handleMessageDelete);
client.on(Events.MessageUpdate, handleMessageUpdate);
client.on(Events.MessageBulkDelete, handleMessageDeleteBulk);

client.on(Events.MessageReactionAdd, handleMessageReactionAdd);
client.on(Events.MessageReactionRemove, handleMessageReactionRemove);

// 봇 로그인
client.login(config.DISCORD_TOKEN).then(() => {
    console.log("봇이 시작되었습니다.");
});