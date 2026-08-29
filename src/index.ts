import { Client, Events, Partials } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { startScheduledJobs } from "./scheduler";
import { handleMessageReactionAdd } from "./events/messageReactionAdd";
import { handleMessageReactionRemove } from "./events/messageReactionRemove";
import { handleTicketMenuInteraction } from "./events/ticketInteractions";
import { closeTicket } from "./commands/ticket";
import { restoreGiveaways } from "./giveaway-utils";

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

const client = new Client({
    intents: ["Guilds","GuildMessages","DirectMessages","GuildMembers","GuildVoiceStates","GuildMessageReactions","GuildEmojisAndStickers","GuildIntegrations","GuildWebhooks","GuildInvites","GuildPresences","GuildBans","GuildModeration","MessageContent"],
    partials: [Partials.Message,Partials.Channel,Partials.Reaction,Partials.User,Partials.GuildMember,Partials.ThreadMember,Partials.GuildScheduledEvent]
});

client.once(Events.ClientReady, async () => {
    console.log(`Discord bot is ready! 🤖`);
    console.log(`Logged in as ${client.user!.tag}!`);
    client.user?.setActivity('Activity', { type: 3 });

    try {
        console.log("Started refreshing application (/) commands.");
        await deployCommands();
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error("❌ 슬래시 명령어 배포 실패:", error);
    }

    startScheduledJobs(client);
    restoreGiveaways(client);
    console.log("스케줄러가 시작되었습니다.");
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = commands[interaction.commandName as keyof typeof commands];

            if (!command) {
                console.error(`❌ 등록되지 않은 명령어 실행: ${interaction.commandName}`);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "❌ 이 명령어를 찾을 수 없습니다. 봇을 다시 시작해주세요.", ephemeral: true });
                }
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌ Error executing command ${interaction.commandName}:`, error);

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "❌ 명령어 실행 중 오류가 발생했습니다.", ephemeral: true }).catch(console.error);
                } else if (interaction.deferred) {
                    await interaction.editReply({ content: "❌ 명령어 실행 중 오류가 발생했습니다." }).catch(console.error);
                }
            }
            return;
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'create-ticket-menu') {
            await handleTicketMenuInteraction(interaction);
            return;
        }

        if (interaction.isButton() && interaction.customId === 'close-ticket-button') {
            await interaction.deferReply();
            await closeTicket(interaction);
        }
    } catch (error) {
        console.error('❌ Error handling interaction:', error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ 요청을 처리하는 중 오류가 발생했습니다.', ephemeral: true }).catch(console.error);
        } else if (interaction.deferred) {
            await interaction.editReply({ content: '❌ 요청을 처리하는 중 오류가 발생했습니다.' }).catch(console.error);
        }
    }
});

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
client.on(Events.MessageReactionAdd, handleMessageReactionAdd);
client.on(Events.MessageReactionRemove, handleMessageReactionRemove);
client.login(config.DISCORD_TOKEN).then(() => console.log("봇이 시작되었습니다.")).catch((error) => console.error("❌ 봇 로그인 실패:", error));
