import { StringSelectMenuInteraction, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ticketSystem } from '../utils/ticketSystem';

const CATEGORY_NAMES: Record<string, string> = { general: '일반문의', report: '신고', event: '이벤트' };

export async function handleTicketMenuInteraction(interaction: StringSelectMenuInteraction) {
    if (!interaction.guild) return interaction.reply({ content: '이 기능은 서버에서만 사용할 수 있습니다.', ephemeral: true });
    if (ticketSystem.hasActiveTicket(interaction.guild.id, interaction.user.id)) return interaction.reply({ content: '❌ 이미 진행 중인 문의가 있습니다.', ephemeral: true });
    const setup = ticketSystem.getSetup(interaction.guild.id);
    if (!setup) return interaction.reply({ content: '티켓 시스템이 설정되지 않았습니다.', ephemeral: true });

    const selectedCategory = interaction.values[0];
    await interaction.deferReply({ ephemeral: true });
    try {
        const category = await interaction.guild.channels.fetch(setup.categoryParent);
        const staffRole = await interaction.guild.roles.fetch(setup.staffRole);
        if (!category || category.type !== ChannelType.GuildCategory) return interaction.editReply('카테고리를 찾을 수 없습니다.');
        if (!staffRole) return interaction.editReply('스태프 역할을 찾을 수 없습니다.');

        const ticketChannel = await interaction.guild.channels.create({
            name: `${CATEGORY_NAMES[selectedCategory] || selectedCategory}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
            ]
        });
        ticketSystem.addTicket(interaction.guild.id, { channelId: ticketChannel.id, userId: interaction.user.id, category: selectedCategory, active: true });

        const welcomeEmbed = new EmbedBuilder().setTitle(`📩 ${CATEGORY_NAMES[selectedCategory] || selectedCategory} 티켓`).setDescription(`<@${interaction.user.id}> 님, <@&${staffRole.id}> 님.\n\n문의 내용을 남겨주세요.`).setColor(0x5865F2).setTimestamp();
        const closeButton = new ButtonBuilder().setCustomId('close-ticket-button').setLabel('문의 종료').setStyle(ButtonStyle.Danger).setEmoji('🔒');
        await ticketChannel.send({ content: `<@${interaction.user.id}> <@&${staffRole.id}>`, embeds: [welcomeEmbed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton)] });
        await interaction.editReply(`✅ 티켓이 생성되었습니다: <#${ticketChannel.id}>`);
    } catch (error) { console.error('Error creating ticket:', error); await interaction.editReply('티켓 생성 중 오류가 발생했습니다.'); }
}
