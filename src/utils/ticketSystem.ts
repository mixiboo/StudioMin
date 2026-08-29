import fs from 'fs';
import path from 'path';

interface TicketSetup { panelChannel: string; staffRole: string; categoryParent: string; logChannel: string; }
interface ActiveTicket { channelId: string; userId: string; category: string; active: boolean; }
interface GuildData { setup?: TicketSetup; activeTickets: ActiveTicket[]; }
interface TicketSystemData { [guildId: string]: GuildData; }
const DATA_FILE = path.join(process.cwd(), 'ticket_system.json');

export class TicketSystemManager {
    private data: TicketSystemData = {};
    constructor() { this.loadData(); }
    private loadData() { try { if (fs.existsSync(DATA_FILE)) this.data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch { this.data = {}; } }
    private saveData() { try { fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8'); } catch (error) { console.error('Error saving ticket system data:', error); } }
    private ensureGuildData(guildId: string) { if (!this.data[guildId]) this.data[guildId] = { activeTickets: [] }; }
    public setSetup(guildId: string, setup: TicketSetup) { this.ensureGuildData(guildId); this.data[guildId].setup = setup; this.saveData(); }
    public getSetup(guildId: string) { return this.data[guildId]?.setup; }
    public addTicket(guildId: string, ticket: ActiveTicket) { this.ensureGuildData(guildId); this.data[guildId].activeTickets.push(ticket); this.saveData(); }
    public hasActiveTicket(guildId: string, userId: string) { return this.data[guildId]?.activeTickets.some(t => t.userId === userId && t.active) ?? false; }
    public getTicketByChannel(guildId: string, channelId: string) { return this.data[guildId]?.activeTickets.find(t => t.channelId === channelId); }
    public getActiveTickets(guildId: string) { return this.data[guildId]?.activeTickets.filter(t => t.active) ?? []; }
    public closeTicket(guildId: string, channelId: string) { const g = this.data[guildId]; if (!g) return; const t = g.activeTickets.find(t => t.channelId === channelId); if (t) { t.active = false; this.saveData(); } }
}
export const ticketSystem = new TicketSystemManager();
