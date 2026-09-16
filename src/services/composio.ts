const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const COMPOSIO_USER_ID = process.env.COMPOSIO_USER_ID;

export async function getComposioGithubRepository() {
    if (!COMPOSIO_API_KEY) {
        throw new Error("COMPOSIO_API_KEY is not configured.");
    }

    if (!COMPOSIO_USER_ID) {
        throw new Error("COMPOSIO_USER_ID is not configured.");
    }

    const { Composio } = await import("@composio/core");
    const composio = new Composio({ apiKey: COMPOSIO_API_KEY });

    const session = await composio.create(COMPOSIO_USER_ID, {
        toolkits: ["github"],
        tools: {
            github: ["GITHUB_GET_A_REPOSITORY"],
        },
        sandbox: { enable: false },
    });

    return session.execute("GITHUB_GET_A_REPOSITORY", {
        owner: "mixiboo",
        repo: "StudioMin",
    });
}
