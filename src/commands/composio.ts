import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { getComposioGithubRepository } from "../services/composio";

export const data = new SlashCommandBuilder()
    .setName("composio")
    .setDescription("Composio로 StudioMin GitHub 연결을 테스트합니다.");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const result = await getComposioGithubRepository();
        const repository = (result as any)?.data ?? result;
        const name = repository?.full_name ?? repository?.name ?? "unknown";
        const branch = repository?.default_branch ?? "unknown";

        await interaction.editReply(
            `✅ Composio 연결 성공!\\n\\n` +
            `GitHub repository: **${name}**\\n` +
            `Default branch: **${branch}**\\n\\n` +
            `첫 번째 실제 Composio tool call이 정상 실행됐습니다.`
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await interaction.editReply(
            `❌ Composio 테스트 실패\\n\\n${message}\\n\\n` +
            `필요한 환경 변수와 Composio 프로젝트의 GitHub 연결 상태를 확인해주세요.`
        );
    }
}
