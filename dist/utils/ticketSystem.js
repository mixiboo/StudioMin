"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketSystem = exports.TicketSystemManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const DATA_FILE = (0, path_1.join)(process.cwd(), 'ticket_system.json');
class TicketSystemManager {
    constructor() {
        this.data = {};
        this.loadData();
    }
    loadData() {
        try {
            if ((0, fs_1.existsSync)(DATA_FILE)) {
                this.data = JSON.parse((0, fs_1.readFileSync)(DATA_FILE, 'utf-8'));
            }
        }
        catch (_a) {
            this.data = {};
        }
    }
    saveData() {
        try {
            (0, fs_1.writeFileSync)(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error saving ticket system data:', error);
        }
    }
    ensureGuildData(guildId) {
        if (!this.data[guildId])
            this.data[guildId] = { activeTickets: [] };
    }
    setSetup(guildId, setup) {
        this.ensureGuildData(guildId);
        this.data[guildId].setup = setup;
        this.saveData();
    }
    getSetup(guildId) {
        return this.data[guildId]?.setup;
    }
    addTicket(guildId, ticket) {
        this.ensureGuildData(guildId);
        this.data[guildId].activeTickets.push(ticket);
        this.saveData();
    }
    hasActiveTicket(guildId, userId) {
        return this.data[guildId]?.activeTickets.some(t => t.userId === userId && t.active) ?? false;
    }
    getTicketByChannel(guildId, channelId) {
        return this.data[guildId]?.activeTickets.find(t => t.channelId === channelId);
    }
    closeTicket(guildId, channelId) {
        const g = this.data[guildId];
        if (!g)
            return;
        const t = g.activeTickets.find(t => t.channelId === channelId);
        if (t) {
            t.active = false;
            this.saveData();
        }
    }
}
exports.TicketSystemManager = TicketSystemManager;
exports.ticketSystem = new TicketSystemManager();
