import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const GUILDS_FILE = path.join(DATA_DIR, 'guilds.json');
const REACTION_ROLES_FILE = path.join(DATA_DIR, 'reaction-roles.json');
const MODERATION_LOGS_FILE = path.join(DATA_DIR, 'moderation-logs.json');

// 타입 정의
export interface Guild {
    id: string;
    welcomeChannelId?: string;
    welcomeMessage?: string;
    leaveChannelId?: string;
    leaveMessage?: string;
    autoRoleId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReactionRole {
    id: number;
    guildId: string;
    messageId: string;
    channelId: string;
    emoji: string;
    roleId: string;
    createdAt: string;
}

export interface ModerationLog {
    id: number;
    guildId: string;
    moderatorId: string;
    targetId: string;
    action: string;
    reason?: string;
    amount?: number;
    createdAt: string;
}

// 데이터 저장소
let guilds: Guild[] = [];
let reactionRoles: ReactionRole[] = [];
let moderationLogs: ModerationLog[] = [];

// 데이터 디렉토리 및 파일 초기화
function ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(GUILDS_FILE)) {
        fs.writeFileSync(GUILDS_FILE, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(REACTION_ROLES_FILE)) {
        fs.writeFileSync(REACTION_ROLES_FILE, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(MODERATION_LOGS_FILE)) {
        fs.writeFileSync(MODERATION_LOGS_FILE, JSON.stringify([], null, 2));
    }
}

// JSON 파일 읽기
function loadData() {
    try {
        guilds = JSON.parse(fs.readFileSync(GUILDS_FILE, 'utf-8'));
        reactionRoles = JSON.parse(fs.readFileSync(REACTION_ROLES_FILE, 'utf-8'));
        moderationLogs = JSON.parse(fs.readFileSync(MODERATION_LOGS_FILE, 'utf-8'));
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// JSON 파일 저장
function saveGuilds() {
    fs.writeFileSync(GUILDS_FILE, JSON.stringify(guilds, null, 2));
}

function saveReactionRoles() {
    fs.writeFileSync(REACTION_ROLES_FILE, JSON.stringify(reactionRoles, null, 2));
}

function saveModerationLogs() {
    fs.writeFileSync(MODERATION_LOGS_FILE, JSON.stringify(moderationLogs, null, 2));
}

// Guild 작업
export const guild = {
    findUnique: async (where: { where: { id: string } }) => {
        return guilds.find(g => g.id === where.where.id) || null;
    },

    upsert: async (data: {
        where: { id: string };
        create: Partial<Guild>;
        update: Partial<Guild>;
    }) => {
        const existingIndex = guilds.findIndex(g => g.id === data.where.id);
        const now = new Date().toISOString();

        if (existingIndex >= 0) {
            // Update
            guilds[existingIndex] = {
                ...guilds[existingIndex],
                ...data.update,
                updatedAt: now
            };
        } else {
            // Create
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

// ReactionRole 작업
export const reactionRole = {
    findUnique: async (where: { where: { messageId_emoji: { messageId: string; emoji: string } } }) => {
        const { messageId, emoji } = where.where.messageId_emoji;
        return reactionRoles.find(rr => rr.messageId === messageId && rr.emoji === emoji) || null;
    },

    findMany: async (where?: { where?: { guildId?: string; messageId?: string } }) => {
        if (!where?.where) return reactionRoles;
        
        let filtered = reactionRoles;
        if (where.where.guildId) {
            filtered = filtered.filter(rr => rr.guildId === where.where!.guildId);
        }
        if (where.where.messageId) {
            filtered = filtered.filter(rr => rr.messageId === where.where!.messageId);
        }
        return filtered;
    },

    create: async (data: { data: Omit<ReactionRole, 'id' | 'createdAt'> }) => {
        const newId = reactionRoles.length > 0 ? Math.max(...reactionRoles.map(rr => rr.id)) + 1 : 1;
        const newReactionRole: ReactionRole = {
            ...data.data,
            id: newId,
            createdAt: new Date().toISOString()
        };
        reactionRoles.push(newReactionRole);
        saveReactionRoles();
        return newReactionRole;
    },

    delete: async (where: { where: { id: number } }) => {
        const index = reactionRoles.findIndex(rr => rr.id === where.where.id);
        if (index >= 0) {
            const deleted = reactionRoles[index];
            reactionRoles.splice(index, 1);
            saveReactionRoles();
            return deleted;
        }
        return null;
    },

    deleteMany: async (where: { where: { messageId: string } }) => {
        const initialLength = reactionRoles.length;
        reactionRoles = reactionRoles.filter(rr => rr.messageId !== where.where.messageId);
        const deletedCount = initialLength - reactionRoles.length;
        if (deletedCount > 0) {
            saveReactionRoles();
        }
        return { count: deletedCount };
    }
};

// ModerationLog 작업
export const moderationLog = {
    create: async (data: { data: Omit<ModerationLog, 'id' | 'createdAt'> }) => {
        const newId = moderationLogs.length > 0 ? Math.max(...moderationLogs.map(ml => ml.id)) + 1 : 1;
        const newLog: ModerationLog = {
            ...data.data,
            id: newId,
            createdAt: new Date().toISOString()
        };
        moderationLogs.push(newLog);
        saveModerationLogs();
        return newLog;
    }
};

// 초기화
ensureDataDirectory();
loadData();

// Graceful shutdown
process.on('beforeExit', () => {
    console.log('Saving data before exit...');
});

export const db = {
    guild,
    reactionRole,
    moderationLog
};
