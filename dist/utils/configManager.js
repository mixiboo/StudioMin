"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = readConfig;
exports.writeConfig = writeConfig;
exports.getGuildConfig = getGuildConfig;
exports.getDefaultToggles = getDefaultToggles;
exports.setLogChannel = setLogChannel;
exports.setEventToggle = setEventToggle;
exports.isEventEnabled = isEventEnabled;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG_PATH = path.join(process.cwd(), 'config.json');
function readConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            fs.writeFileSync(CONFIG_PATH, '{}', 'utf-8');
            return {};
        }
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading config:', error);
        return {};
    }
}
function writeConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('Error writing config:', error);
    }
}
function getGuildConfig(guildId) {
    const config = readConfig();
    return config[guildId];
}
function getDefaultToggles() {
    return {
        messageDelete: false,
        messageUpdate: false,
        messageDeleteBulk: false,
        memberJoin: false,
        memberLeave: false,
        memberUpdate: false,
        memberBan: false,
        memberUnban: false,
        channelCreate: false,
        channelDelete: false,
        channelUpdate: false,
        roleCreate: false,
        roleDelete: false,
        roleUpdate: false,
        voiceStateUpdate: false,
        inviteCreate: false,
        inviteDelete: false,
        emojiCreate: false,
        emojiDelete: false,
        emojiUpdate: false,
        stickerCreate: false,
        stickerDelete: false,
        stickerUpdate: false,
    };
}
function setLogChannel(guildId, channelId) {
    const config = readConfig();
    if (!config[guildId]) {
        config[guildId] = {
            logChannel: channelId,
            toggles: getDefaultToggles()
        };
    }
    else {
        config[guildId].logChannel = channelId;
    }
    writeConfig(config);
}
function setEventToggle(guildId, eventName, value) {
    const config = readConfig();
    if (!config[guildId]) {
        config[guildId] = {
            toggles: getDefaultToggles()
        };
    }
    config[guildId].toggles[eventName] = value;
    writeConfig(config);
}
function isEventEnabled(guildId, eventName) {
    const guildConfig = getGuildConfig(guildId);
    if (!guildConfig || !guildConfig.logChannel)
        return false;
    return guildConfig.toggles[eventName] === true;
}
