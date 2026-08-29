"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
function parseColor(value) { if (!value) return 0x5865f2; const normalized = value.trim().replace(/^#/, ''); if (!/^[0-9a-fA-F]{6}$/.test(normalized)) throw new Error('invalid color'); return Number.parseInt(normalized, 16); }
function isValidUrl(value) { if (!value) return true; try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; } catch { return false; } }
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('embed').setNameLocalizations({ ko: '임베드' }).setDescription('관리자용 임베드 메시지 제작 및 전송')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addChannelOption(option => option.setName('channel').setNameLocalizations({ ko: '채널' }).setDescription('임베드를 보낼 채널').addChannelTypes(discord_js_1.ChannelType.GuildText).setRequired(true))
    .addStringOption(option => option.setName('title').setNameLocalizations({ ko: '제목' }).setDescription('임베드 제목').setMaxLength(256).setRequired(true))
    .addStringOption(option => option.setName('content').setNameLocalizations({ ko: '내용' }).setDescription('임베드 설명').setMaxLength(4096).setRequired(true))
    .addStringOption(option => option.setName('color').setNameLocalizations({ ko: '색상' }).setDescription('HEX 색상 (예: #5865F2)').setMaxLength(7).setRequired(false))
    .addStringOption(option => option.setName('thumbnail').setNameLocalizations({ ko: '썸네일' }).setDescription('썸네일 이미지 URL').setRequired(false))
    .addStringOption(option => option.setName('image').setNameLocalizations({ ko: '이미지' }).setDescription('본문 이미지 URL').setRequired(false))
    .addStringOption(option => option.setName('footer').setNameLocalizations({ ko: '푸터' }).setDescription('임베드 하단 문구').setMaxLength(2048).setRequired(false));
async function execute(interaction) {
    if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator)) return interaction.reply({ content: '관리자만 사용할 수 있는 명령어입니다.', ephemeral: true });
    const channel = interaction.options.getChannel('channel', true); const title = interaction.options.getString('title', true); const description = interaction.options.getString('content', true);
    const color = interaction.options.getString('color'); const thumbnail = interaction.options.getString('thumbnail'); const image = interaction.options.getString('image'); const footer = interaction.options.getString('footer');
    if (!(channel instanceof discord_js_1.TextChannel)) return interaction.reply({ content: '텍스트 채널만 선택할 수 있습니다.', ephemeral: true });
    if (!isValidUrl(thumbnail) || !isValidUrl(image)) return interaction.reply({ content: '❌ 썸네일/이미지는 http 또는 https URL만 사용할 수 있습니다.', ephemeral: true });
    let parsedColor; try { parsedColor = parseColor(color); } catch { return interaction.reply({ content: '❌ 색상은 `#5865F2` 같은 6자리 HEX 형식으로 입력해주세요.', ephemeral: true }); }
    const embed = new discord_js_1.EmbedBuilder().setTitle(title).setDescription(description).setColor(parsedColor);
    if (thumbnail) embed.setThumbnail(thumbnail); if (image) embed.setImage(image); if (footer) embed.setFooter({ text: footer });
    try { await channel.send({ embeds: [embed] }); return interaction.reply({ content: `✅ ${channel}에 임베드를 전송했습니다.`, ephemeral: true }); }
    catch (error) { console.error('[임베드] 전송 실패:', error); return interaction.reply({ content: '❌ 임베드를 전송하지 못했습니다. 봇의 채널 권한과 이미지 URL을 확인해주세요.', ephemeral: true }); }
}
exports.execute = execute;
