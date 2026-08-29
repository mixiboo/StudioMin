"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCommands = deployCommands;
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const commands_1 = require("./commands");
const commandsData = Object.values(commands_1.commands).map((command) => command.data.toJSON());
const rest = new discord_js_1.REST({ version: "10" }).setToken(config_1.config.DISCORD_TOKEN);
const GUILD_ID = process.env.DISCORD_GUILD_ID;
async function deployCommands() {
    if (!GUILD_ID) throw new Error("Missing DISCORD_GUILD_ID environment variable");
    console.log("Started refreshing application (/) commands for the server.");
    await rest.put(discord_js_1.Routes.applicationGuildCommands(config_1.config.DISCORD_CLIENT_ID, GUILD_ID), { body: commandsData });
    console.log("Successfully reloaded application (/) commands for the server.");
}
