"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGiveaways = loadGiveaways;
exports.saveGiveaways = saveGiveaways;
exports.endGiveaway = endGiveaway;
exports.scheduleGiveaway = scheduleGiveaway;
exports.cancelGiveaway = cancelGiveaway;
exports.restoreGiveaways = restoreGiveaways;
const discord_js_1 = require("discord.js");
const fs = require("fs");
const path = require("path");
const GIVEAWAYS_FILE = path.join(process.cwd(), 'giveaways.json');
const activeTimers = new Map();
function loadGiveaways() { try { if (!fs.existsSync(GIVEAWAYS_FILE)) { fs.writeFileSync(GIVEAWAYS_FILE, '[]', 'utf-8'); return []; } return JSON.parse(fs.readFileSync(GIVEAWAYS_FILE, 'utf-8')); } catch { return []; } }
function saveGiveaways(giveaways) { fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(giveaways, null, 2), 'utf-8'); }
async function endGiveaway(client, messageId) {
    try {
        const giveaways = loadGiveaways();
        const i = giveaways.findIndex(g => g.messageId === messageId);
        if (i === -1) return;
        const g = giveaways[i];
        const channel = await client.channels.fetch(g.channelId);
        if (!channel?.isTextBased()) return;
        const message = await channel.messages.fetch(g.messageId);
        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) return;
        const users = await reaction.users.fetch();
        const participants = users.filter(u => !u.bot).map(u => u.id);
        const winners = participants.sort(() => Math.random() - 0.5).slice(0, Math.min(g.winnerCount, participants.length));
        await channel.send({ content: winners.length ? `🎉 축하합니다! ${winners.map(id => `<@${id}>`).join(', ')} 님!\n**${g.prize}**에 당첨되셨습니다!` : '🎉 추첨이 종료되었습니다!\n\n참가자가 없어 당첨자가 없습니다.', reply: { messageReference: message.id } });
        const embed = new discord_js_1.EmbedBuilder().setTitle('🎉 추첨 종료 🎉').setDescription(`**경품:** ${g.prize}`).addFields({ name: '당첨자 수', value: `${g.winnerCount}명`, inline: true }, { name: '참가자 수', value: `${participants.length}명`, inline: true }, { name: '당첨자', value: winners.length ? winners.map(id => `<@${id}>`).join('\n') : '당첨자 없음' }).setColor(0xFF0000).setTimestamp();
        await message.edit({ embeds: [embed] });
        giveaways[i].isActive = false;
        giveaways[i].winners = winners;
        saveGiveaways(giveaways);
        cancelGiveaway(messageId);
    }
    catch (error) { console.error('Error ending giveaway:', error); }
}
function scheduleGiveaway(client, messageId, endTime) { const left = endTime - Date.now(); if (left <= 0) void endGiveaway(client, messageId); else { const t = setTimeout(() => void endGiveaway(client, messageId), left); activeTimers.set(messageId, t); } }
function cancelGiveaway(messageId) { const t = activeTimers.get(messageId); if (t) { clearTimeout(t); activeTimers.delete(messageId); } }
function restoreGiveaways(client) { for (const g of loadGiveaways().filter(g => g.isActive)) scheduleGiveaway(client, g.messageId, g.endTime); }
