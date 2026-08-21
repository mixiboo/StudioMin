import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

const GUILD_ID = process.env.DISCORD_GUILD_ID;

export async function deployCommands() {
    try {
        if (!GUILD_ID) {
            throw new Error("Missing DISCORD_GUILD_ID environment variable");
        }

        console.log("Started refreshing application (/) commands for the server.");

        await rest.put(
            Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, GUILD_ID),
            {
                body: commandsData,
            }
        );

        console.log("Successfully reloaded application (/) commands for the server.");
    } catch (error) {
        console.error(error);
    }
}

deployCommands();
