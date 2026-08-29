"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const commands_1 = require("./commands");
const deploy_commands_1 = require("./deploy-commands");
const scheduler_1 = require("./scheduler");
const webPanel_1 = require("./webPanel");
const messageReactionAdd_1 = require("./events/messageReactionAdd");
const messageReactionRemove_1 = require("./events/messageReactionRemove");
const messageCreate_1 = require("./events/messageCreate");
const messageDelete_1 = require("./events/messageDelete");
const messageUpdate_1 = require("./events/messageUpdate");
const messageDeleteBulk_1 = require("./events/messageDeleteBulk");
const guildMemberAdd_1 = require("./events/guildMemberAdd");
const guildMemberRemove_1 = require("./events/guildMemberRemove");
const guildMemberUpdate_1 = require("./events/guildMemberUpdate");
const guildBanAdd_1 = require("./events/guildBanAdd");
const guildBanRemove_1 = require("./events/guildBanRemove");
const channelCreate_1 = require("./events/channelCreate");
const channelDelete_1 = require("./events/channelDelete");
const channelUpdate_1 = require("./events/channelUpdate");
const roleCreate_1 = require("./events/roleCreate");
const roleDelete_1 = require("./events/roleDelete");
const roleUpdate_1 = require("./events/roleUpdate");
const voiceStateUpdate_1 = require("./events/voiceStateUpdate");
const inviteCreate_1 = require("./events/inviteCreate");
const inviteDelete_1 = require("./events/inviteDelete");
const emojiCreate_1 = require("./events/emojiCreate");
const emojiDelete_1 = require("./events/emojiDelete");
const emojiUpdate_1 = require("./events/emojiUpdate");
const stickerCreate_1 = require("./events/stickerCreate");
const stickerDelete_1 = require("./events/stickerDelete");
const stickerUpdate_1 = require("./events/stickerUpdate");
const client = new discord_js_1.Client({
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
        discord_js_1.Partials.Message,
        discord_js_1.Partials.Channel,
        discord_js_1.Partials.Reaction,
        discord_js_1.Partials.User,
        discord_js_1.Partials.GuildMember,
        discord_js_1.Partials.ThreadMember,
        discord_js_1.Partials.GuildScheduledEvent
    ]
});
client.once(discord_js_1.Events.ClientReady, async () => {
    console.log(`Discord bot is ready! 🤖`);
    console.log(`Logged in as ${client.user.tag}!`);
    client.user?.setActivity('Activity', { type: 3 });
    try {
        console.log("Started refreshing application (/) commands.");
        await (0, deploy_commands_1.deployCommands)();
        console.log("Successfully reloaded application (/) commands.");
    }
    catch (error) {
        console.error("❌ 슬래시 명령어 배포 실패:", error);
    }
    (0, scheduler_1.startScheduledJobs)(client);
    (0, webPanel_1.startWebPanel)(client);
    console.log("스케줄러가 시작되었습니다.");
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    try {
        if (!interaction.isChatInputCommand())
            return;
        const command = commands_1.commands[interaction.commandName];
        if (!command) {
            console.error(`❌ 등록되지 않은 명령어 실행: ${interaction.commandName}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "❌ 이 명령어를 찾을 수 없습니다. 봇을 다시 시작해주세요.", ephemeral: true });
            }
            return;
        }
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(`❌ Error executing command ${interaction.commandName}:`, error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "❌ 명령어 실행 중 오류가 발생했습니다.", ephemeral: true }).catch(console.error);
            }
            else if (interaction.deferred) {
                await interaction.editReply({ content: "❌ 명령어 실행 중 오류가 발생했습니다." }).catch(console.error);
            }
        }
        return;
    }
    catch (error) {
        console.error('❌ Error handling interaction:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ 요청을 처리하는 중 오류가 발생했습니다.', ephemeral: true }).catch(console.error);
        }
        else if (interaction.deferred) {
            await interaction.editReply({ content: '❌ 요청을 처리하는 중 오류가 발생했습니다.' }).catch(console.error);
        }
    }
});
client.on(discord_js_1.Events.MessageCreate, messageCreate_1.handleMessageCreate);
client.on(discord_js_1.Events.MessageDelete, messageDelete_1.handleMessageDelete);
client.on(discord_js_1.Events.MessageUpdate, messageUpdate_1.handleMessageUpdate);
client.on(discord_js_1.Events.MessageBulkDelete, messageDeleteBulk_1.handleMessageDeleteBulk);
client.on(discord_js_1.Events.GuildMemberAdd, guildMemberAdd_1.handleGuildMemberAdd);
client.on(discord_js_1.Events.GuildMemberRemove, guildMemberRemove_1.handleGuildMemberRemove);
client.on(discord_js_1.Events.GuildMemberUpdate, guildMemberUpdate_1.handleGuildMemberUpdate);
client.on(discord_js_1.Events.GuildBanAdd, guildBanAdd_1.handleGuildBanAdd);
client.on(discord_js_1.Events.GuildBanRemove, guildBanRemove_1.handleGuildBanRemove);
client.on(discord_js_1.Events.ChannelCreate, channelCreate_1.handleChannelCreate);
client.on(discord_js_1.Events.ChannelDelete, channelDelete_1.handleChannelDelete);
client.on(discord_js_1.Events.ChannelUpdate, channelUpdate_1.handleChannelUpdate);
client.on(discord_js_1.Events.GuildRoleCreate, roleCreate_1.handleGuildRoleCreate);
client.on(discord_js_1.Events.GuildRoleDelete, roleDelete_1.handleGuildRoleDelete);
client.on(discord_js_1.Events.GuildRoleUpdate, roleUpdate_1.handleGuildRoleUpdate);
client.on(discord_js_1.Events.VoiceStateUpdate, voiceStateUpdate_1.handleVoiceStateUpdate);
client.on(discord_js_1.Events.InviteCreate, inviteCreate_1.handleInviteCreate);
client.on(discord_js_1.Events.InviteDelete, inviteDelete_1.handleInviteDelete);
client.on(discord_js_1.Events.GuildEmojiCreate, emojiCreate_1.handleGuildEmojiCreate);
client.on(discord_js_1.Events.GuildEmojiDelete, emojiDelete_1.handleGuildEmojiDelete);
client.on(discord_js_1.Events.GuildEmojiUpdate, emojiUpdate_1.handleGuildEmojiUpdate);
client.on(discord_js_1.Events.GuildStickerCreate, stickerCreate_1.handleGuildStickerCreate);
client.on(discord_js_1.Events.GuildStickerDelete, stickerDelete_1.handleGuildStickerDelete);
client.on(discord_js_1.Events.GuildStickerUpdate, stickerUpdate_1.handleGuildStickerUpdate);
client.on(discord_js_1.Events.MessageReactionAdd, messageReactionAdd_1.handleMessageReactionAdd);
client.on(discord_js_1.Events.MessageReactionRemove, messageReactionRemove_1.handleMessageReactionRemove);
client.login(config_1.config.DISCORD_TOKEN).then(() => console.log("봇이 시작되었습니다.")).catch((error) => console.error("❌ 봇 로그인 실패:", error));
