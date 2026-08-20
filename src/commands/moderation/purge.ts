import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    TextChannel,
} from "discord.js";
import { db } from "../../services/database";
import { t } from "../../services/localization";
import { successEmbed, errorEmbed } from "../../utils/embed";

export const data = new SlashCommandBuilder()
    .setName("purge")
    .setNameLocalizations({ ko: t("commands.purge.name") })
    .setDescription("Delete multiple messages at once")
    .setDescriptionLocalizations({ ko: t("commands.purge.description") })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setNameLocalizations({ ko: "개수" })
            .setDescription("Number of messages to delete (1-100)")
            .setDescriptionLocalizations({ ko: t("commands.purge.options.amount") })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.channel || !(interaction.channel instanceof TextChannel)) {
        return interaction.reply({
            embeds: [errorEmbed(t("errors.guild_only"))],
            ephemeral: true,
        });
    }

    const amount = interaction.options.getInteger("amount", true);

    if (amount < 1 || amount > 100) {
        return interaction.reply({
            embeds: [errorEmbed(t("commands.purge.error_amount"))],
            ephemeral: true,
        });
    }

    try {
        const deleted = await interaction.channel.bulkDelete(amount, true);

        // Ensure guild record exists (avoid foreign key violations)
        await db.guild.upsert({
            where: { id: interaction.guildId },
            update: {},
            create: { id: interaction.guildId },
        });

        // Log to database
        await db.moderationLog.create({
            data: {
                guildId: interaction.guildId,
                moderatorId: interaction.user.id,
                targetId: interaction.channel.id,
                action: "purge",
                amount: deleted.size,
            },
        });

        return interaction.reply({
            embeds: [successEmbed(t("commands.purge.success", { count: deleted.size.toString() }))],
            ephemeral: true,
        });
    } catch (error) {
        console.error("Purge error:", error);
        return interaction.reply({
            embeds: [errorEmbed(t("commands.purge.error_old_messages"))],
            ephemeral: true,
        });
    }
}
