"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.moderationLog = exports.reactionRole = exports.guild = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
const GUILDS_FILE = path_1.default.join(DATA_DIR, 'guilds.json');
const REACTION_ROLES_FILE = path_1.default.join(DATA_DIR, 'reaction-roles.json');
const MODERATION_LOGS_FILE = path_1.default.join(DATA_DIR, 'moderation-logs.json');
let guilds = [];
let reactionRoles = [];
let moderationLogs = [];
function ensureDataDirectory() {
    if (!fs_1.default.existsSync(DATA_DIR)) {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs_1.default.existsSync(GUILDS_FILE)) {
        fs_1.default.writeFileSync(GUILDS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs_1.default.existsSync(REACTION_ROLES_FILE)) {
        fs_1.default.writeFileSync(REACTION_ROLES_FILE, JSON.stringify([], null, 2));
    }
    if (!fs_1.default.existsSync(MODERATION_LOGS_FILE)) {
        fs_1.default.writeFileSync(MODERATION_LOGS_FILE, JSON.stringify([], null, 2));
    }
}
function loadData() {
    try {
        guilds = JSON.parse(fs_1.default.readFileSync(GUILDS_FILE, 'utf-8'));
        reactionRoles = JSON.parse(fs_1.default.readFileSync(REACTION_ROLES_FILE, 'utf-8'));
        moderationLogs = JSON.parse(fs_1.default.readFileSync(MODERATION_LOGS_FILE, 'utf-8'));
    }
    catch (error) {
        console.error('Error loading data:', error);
    }
}
function saveGuilds() {
    fs_1.default.writeFileSync(GUILDS_FILE, JSON.stringify(guilds, null, 2));
}
function saveReactionRoles() {
    fs_1.default.writeFileSync(REACTION_ROLES_FILE, JSON.stringify(reactionRoles, null, 2));
}
function saveModerationLogs() {
    fs_1.default.writeFileSync(MODERATION_LOGS_FILE, JSON.stringify(moderationLogs, null, 2));
}
exports.guild = {
    findUnique: async (where) => {
        return guilds.find(g => g.id === where.where.id) || null;
    },
    upsert: async (data) => {
        const existingIndex = guilds.findIndex(g => g.id === data.where.id);
        const now = new Date().toISOString();
        if (existingIndex >= 0) {
            guilds[existingIndex] = {
                ...guilds[existingIndex],
                ...data.update,
                updatedAt: now
            };
        }
        else {
            guilds.push({
                id: data.where.id,
                welcomeMessage: "Welcome {user}! You are the {memberCount}th member of {server}!",
                leaveMessage: "{user} has left the server.",
                createdAt: now,
                updatedAt: now,
                ...data.create
            });
        }
        saveGuilds();
        return guilds.find(g => g.id === data.where.id);
    }
};
exports.reactionRole = {
    findUnique: async (where) => {
        const { messageId, emoji } = where.where.messageId_emoji;
        return reactionRoles.find(rr => rr.messageId === messageId && rr.emoji === emoji) || null;
    },
    findMany: async (where) => {
        if (!where?.where)
            return reactionRoles;
        let filtered = reactionRoles;
        if (where.where.guildId) {
            filtered = filtered.filter(rr => rr.guildId === where.where.guildId);
        }
        if (where.where.messageId) {
            filtered = filtered.filter(rr => rr.messageId === where.where.messageId);
        }
        return filtered;
    },
    create: async (data) => {
        const newId = reactionRoles.length > 0 ? Math.max(...reactionRoles.map(rr => rr.id)) + 1 : 1;
        const newReactionRole = {
            ...data.data,
            id: newId,
            createdAt: new Date().toISOString()
        };
        reactionRoles.push(newReactionRole);
        saveReactionRoles();
        return newReactionRole;
    },
    delete: async (where) => {
        const index = reactionRoles.findIndex(rr => rr.id === where.where.id);
        if (index >= 0) {
            const deleted = reactionRoles[index];
            reactionRoles.splice(index, 1);
            saveReactionRoles();
            return deleted;
        }
        return null;
    },
    deleteMany: async (where) => {
        const initialLength = reactionRoles.length;
        reactionRoles = reactionRoles.filter(rr => rr.messageId !== where.where.messageId);
        const deletedCount = initialLength - reactionRoles.length;
        if (deletedCount > 0) {
            saveReactionRoles();
        }
        return { count: deletedCount };
    }
};
exports.moderationLog = {
    create: async (data) => {
        const newId = moderationLogs.length > 0 ? Math.max(...moderationLogs.map(ml => ml.id)) + 1 : 1;
        const newLog = {
            ...data.data,
            id: newId,
            createdAt: new Date().toISOString()
        };
        moderationLogs.push(newLog);
        saveModerationLogs();
        return newLog;
    }
};
ensureDataDirectory();
loadData();
process.on('beforeExit', () => {
    console.log('Saving data before exit...');
});
exports.db = {
    guild: exports.guild,
    reactionRole: exports.reactionRole,
    moderationLog: exports.moderationLog
};
