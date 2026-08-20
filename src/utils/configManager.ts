import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export interface GuildConfig {
    logChannel?: string;
    toggles: {
        messageDelete: boolean;
        messageUpdate: boolean;
        messageDeleteBulk: boolean;
        memberJoin: boolean;
        memberLeave: boolean;
        memberUpdate: boolean;
        memberBan: boolean;
        memberUnban: boolean;
        channelCreate: boolean;
        channelDelete: boolean;
        channelUpdate: boolean;
        roleCreate: boolean;
        roleDelete: boolean;
        roleUpdate: boolean;
        voiceStateUpdate: boolean;
        inviteCreate: boolean;
        inviteDelete: boolean;
        emojiCreate: boolean;
        emojiDelete: boolean;
        emojiUpdate: boolean;
        stickerCreate: boolean;
        stickerDelete: boolean;
        stickerUpdate: boolean;
    };
}

export interface Config {
    [guildId: string]: GuildConfig;
}

/**
 * config.json 파일 읽기
 */
export function readConfig(): Config {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            fs.writeFileSync(CONFIG_PATH, '{}', 'utf-8');
            return {};
        }
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading config:', error);
        return {};
    }
}

/**
 * config.json 파일 저장
 */
export function writeConfig(config: Config): void {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing config:', error);
    }
}

/**
 * 길드 설정 가져오기
 */
export function getGuildConfig(guildId: string): GuildConfig | undefined {
    const config = readConfig();
    return config[guildId];
}

/**
 * 기본 토글 객체 생성 (모두 false)
 */
export function getDefaultToggles(): GuildConfig['toggles'] {
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

/**
 * 로그 채널 설정
 */
export function setLogChannel(guildId: string, channelId: string): void {
    const config = readConfig();
    
    if (!config[guildId]) {
        config[guildId] = {
            logChannel: channelId,
            toggles: getDefaultToggles()
        };
    } else {
        config[guildId].logChannel = channelId;
    }
    
    writeConfig(config);
}

/**
 * 이벤트 토글 설정
 */
export function setEventToggle(guildId: string, eventName: keyof GuildConfig['toggles'], value: boolean): void {
    const config = readConfig();
    
    if (!config[guildId]) {
        config[guildId] = {
            toggles: getDefaultToggles()
        };
    }
    
    config[guildId].toggles[eventName] = value;
    writeConfig(config);
}

/**
 * 이벤트가 활성화되어 있는지 확인
 */
export function isEventEnabled(guildId: string, eventName: keyof GuildConfig['toggles']): boolean {
    const guildConfig = getGuildConfig(guildId);
    if (!guildConfig || !guildConfig.logChannel) return false;
    return guildConfig.toggles[eventName] === true;
}
