import { MessageReaction, User, PartialMessageReaction, PartialUser } from "discord.js";
import { db } from "../services/database";

export async function handleMessageReactionRemove(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
) {
    // Ignore bot reactions
    if (user.bot) return;

    // Fetch partial data
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error("Failed to fetch reaction:", error);
            return;
        }
    }

    if (!reaction.message.guildId) return;

    const emoji = reaction.emoji.id || reaction.emoji.name;
    if (!emoji) return;

    // Find reaction role
    const reactionRole = await db.reactionRole.findUnique({
        where: {
            messageId_emoji: {
                messageId: reaction.message.id,
                emoji: emoji,
            },
        },
    });

    if (!reactionRole) return;

    // Remove role from user
    try {
        const guild = reaction.message.guild;
        if (!guild) return;

        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(reactionRole.roleId);

        if (role && member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
        }
    } catch (error) {
        console.error("Failed to remove reaction role:", error);
    }
}
