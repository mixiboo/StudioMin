"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageReactionAdd = handleMessageReactionAdd;
const database_1 = require("../services/database");
async function handleMessageReactionAdd(reaction, user) {
    if (user.bot)
        return;
    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.error("Failed to fetch reaction:", error);
            return;
        }
    }
    if (!reaction.message.guildId)
        return;
    const emoji = reaction.emoji.id || reaction.emoji.name;
    if (!emoji)
        return;
    const reactionRole = await database_1.db.reactionRole.findUnique({
        where: {
            messageId_emoji: {
                messageId: reaction.message.id,
                emoji: emoji,
            },
        },
    });
    if (!reactionRole)
        return;
    try {
        const guild = reaction.message.guild;
        if (!guild)
            return;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(reactionRole.roleId);
        if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
        }
    }
    catch (error) {
        console.error("Failed to add reaction role:", error);
    }
}
