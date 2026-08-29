import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { URL } from "node:url";
import type { Client, TextChannel } from "discord.js";
import { PermissionFlagsBits } from "discord.js";

const sessions = new Set<string>();

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>민쭌봇 관리자</title>
<style>
:root{color-scheme:dark;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0b0d12;color:#f4f7fb}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,#1c2640 0,#0b0d12 42%);min-height:100vh}
.wrap{max-width:1050px;margin:0 auto;padding:28px 18px 50px}.top{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:22px}.brand h1{margin:0;font-size:26px}.brand p{margin:6px 0 0;color:#8d98aa}
.card{background:rgba(18,22,31,.86);border:1px solid #273042;border-radius:18px;padding:20px;box-shadow:0 14px 40px rgba(0,0,0,.2);backdrop-filter:blur(10px)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.full{grid-column:1/-1}label{display:block;font-size:13px;color:#9aa6b8;margin:0 0 7px}input,textarea,select{width:100%;border:1px solid #2d3749;background:#0f141d;color:#fff;border-radius:11px;padding:12px 13px;outline:none}textarea{resize:vertical;min-height:120px}input:focus,textarea:focus,select:focus{border-color:#667eea}
button{border:0;border-radius:11px;padding:11px 15px;background:#5865f2;color:#fff;font-weight:700;cursor:pointer}button.secondary{background:#252d3b}.row{display:flex;gap:10px;align-items:center}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}.msg{margin-top:12px;padding:11px 12px;border-radius:10px;display:none}.ok{display:block;background:#123321;color:#91f2b3}.err{display:block;background:#35171b;color:#ffadb7}
.login{max-width:430px;margin:11vh auto}.muted{color:#8994a7;font-size:13px}.hint{font-size:12px;color:#778297;margin-top:7px}.hidden{display:none}.badge{font-size:12px;color:#aeb8ca;background:#192131;padding:7px 9px;border-radius:999px}
@media(max-width:760px){.grid{grid-template-columns:1fr}.full{grid-column:auto}.top{align-items:flex-start;flex-direction:column}}
</style></head>
<body><div id="app" class="wrap"></div>
<script>
const app=document.getElementById('app');
function esc(s){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
async function api(path,options={}){const r=await fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});let d={};try{d=await r.json()}catch{};if(!r.ok)throw new Error(d.error||'요청에 실패했습니다.');return d}
function login(){app.innerHTML='<div class="login"><div class="card"><div class="brand"><h1>🔒 민쭌봇 관리자</h1><p>관리자 전용 패널</p></div><div style="margin-top:18px"><label>관리자 비밀번호</label><input id="pw" type="password" placeholder="비밀번호 입력"><div class="actions"><button onclick="doLogin()">로그인</button></div><div id="msg" class="msg"></div><p class="hint">이 패널은 관리자 비밀번호가 설정된 경우에만 사용할 수 있습니다.</p></div></div></div>';document.getElementById('pw').focus()}
async function doLogin(){const msg=document.getElementById('msg');try{await api('/api/login',{method:'POST',body:JSON.stringify({password:document.getElementById('pw').value})});load()}catch(e){msg.className='msg err';msg.textContent=e.message}}
async function load(){try{const s=await api('/api/state');render(s)}catch{login()}}
function render(s){const guilds=s.guilds||[];let g=guilds[0]?.id||'';app.innerHTML='<div class="top"><div class="brand"><h1>민쭌봇 관리자 패널</h1><p>메시지와 임베드를 빠르게 전송하세요.</p></div><div class="row"><span class="badge">관리자 전용</span><button class="secondary" onclick="logout()">로그아웃</button></div></div><div class="grid"><div class="card"><label>서버</label><select id="guild" onchange="refreshChannels()">'+guilds.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join('')+'</select></div><div class="card"><label>채널</label><select id="channel"></select></div><div class="card"><h2 style="margin-top:0">📢 메시지 보내기</h2><label>내용</label><textarea id="message" maxlength="2000" placeholder="보낼 메시지를 입력하세요."></textarea><div class="actions"><button onclick="sendMessage()">전송하기</button></div><div id="mmsg" class="msg"></div></div><div class="card"><h2 style="margin-top:0">🖼️ 임베드 보내기</h2><label>제목</label><input id="title" maxlength="256"><label style="margin-top:12px">내용</label><textarea id="content" maxlength="4096"></textarea><div class="row" style="margin-top:12px"><div style="flex:1"><label>색상</label><input id="color" value="#5865F2" maxlength="7"></div><div style="flex:1"><label>푸터</label><input id="footer" maxlength="2048"></div></div><label style="margin-top:12px">썸네일 URL</label><input id="thumbnail" placeholder="https://..."><label style="margin-top:12px">본문 이미지 URL</label><input id="image" placeholder="https://..."><div class="actions"><button onclick="sendEmbed()">임베드 전송</button></div><div id="emsg" class="msg"></div></div></div>';window.state=s;refreshChannels()}
function refreshChannels(){const gid=document.getElementById('guild').value;const guild=window.state.guilds.find(x=>x.id===gid);document.getElementById('channel').innerHTML=(guild?.channels||[]).map(c=>'<option value="'+c.id+'"># '+esc(c.name)+'</option>').join('')}
function show(id,ok,text){const e=document.getElementById(id);e.className='msg '+(ok?'ok':'err');e.textContent=text}
async function sendMessage(){try{await api('/api/message',{method:'POST',body:JSON.stringify({channelId:document.getElementById('channel').value,content:document.getElementById('message').value})});show('mmsg',true,'✅ 메시지를 전송했습니다.');document.getElementById('message').value=''}catch(e){show('mmsg',false,e.message)}}
async function sendEmbed(){try{await api('/api/embed',{method:'POST',body:JSON.stringify({channelId:document.getElementById('channel').value,title:document.getElementById('title').value,content:document.getElementById('content').value,color:document.getElementById('color').value,thumbnail:document.getElementById('thumbnail').value,image:document.getElementById('image').value,footer:document.getElementById('footer').value})});show('emsg',true,'✅ 임베드를 전송했습니다.')}catch(e){show('emsg',false,e.message)}}
async function logout(){await api('/api/logout',{method:'POST'}).catch(()=>{});login()}
login();load();
</script></body></html>`;

function json(res: ServerResponse, status: number, body: unknown) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify(body));
}

function isAuthed(req: IncomingMessage) {
    const cookie = req.headers.cookie ?? "";
    const token = cookie.split(";").map(v => v.trim()).find(v => v.startsWith("studio_session="))?.slice("studio_session=".length);
    return !!token && sessions.has(token);
}

async function readBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => {
            data += chunk;
            if (data.length > 120_000) {
                reject(new Error("요청이 너무 큽니다."));
                req.destroy();
            }
        });
        req.on("end", () => {
            try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error("잘못된 JSON 요청입니다.")); }
        });
        req.on("error", reject);
    });
}

function sameSecret(input: string, expected: string) {
    const a = Buffer.from(input);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

function getGuildState(client: Client) {
    return client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        channels: guild.channels.cache
            .filter(channel => channel.isTextBased() && "send" in channel)
            .map(channel => ({ id: channel.id, name: channel.name ?? "채널" }))
            .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    }));
}

export function startWebPanel(client: Client) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        console.warn("⚠️ ADMIN_PASSWORD가 없어 웹 관리자 패널을 시작하지 않습니다.");
        return;
    }

    const port = Number.parseInt(process.env.WEB_PORT || process.env.PORT || "3000", 10) || 3000;
    const server = createServer(async (req, res) => {
        try {
            const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
            if (req.method === "GET" && url.pathname === "/admin") {
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" });
                res.end(html);
                return;
            }
            if (req.method === "POST" && url.pathname === "/api/login") {
                const body = await readBody(req);
                if (typeof body.password !== "string" || !sameSecret(body.password, password)) { json(res, 401, { error: "비밀번호가 올바르지 않습니다." }); return; }
                const token = randomBytes(32).toString("hex");
                sessions.add(token);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": `studio_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`, "Cache-Control": "no-store" });
                res.end(JSON.stringify({ ok: true }));
                return;
            }
            if (req.method === "POST" && url.pathname === "/api/logout") {
                const cookie = req.headers.cookie ?? "";
                const token = cookie.split(";").map(v => v.trim()).find(v => v.startsWith("studio_session="))?.slice("studio_session=".length);
                if (token) sessions.delete(token);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": "studio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0", "Cache-Control": "no-store" });
                res.end(JSON.stringify({ ok: true }));
                return;
            }
            if (!isAuthed(req)) { json(res, 401, { error: "로그인이 필요합니다." }); return; }
            if (req.method === "GET" && url.pathname === "/api/state") { json(res, 200, { guilds: getGuildState(client) }); return; }
            if (req.method === "POST" && url.pathname === "/api/message") {
                const body = await readBody(req);
                if (typeof body.content !== "string" || body.content.trim().length === 0 || body.content.length > 2000) { json(res, 400, { error: "메시지는 1~2000자로 입력해주세요." }); return; }
                const channel = client.channels.cache.get(String(body.channelId));
                if (!channel || !channel.isTextBased() || !("send" in channel)) { json(res, 400, { error: "유효한 텍스트 채널이 아닙니다." }); return; }
                await channel.send({ content: body.content });
                json(res, 200, { ok: true });
                return;
            }
            if (req.method === "POST" && url.pathname === "/api/embed") {
                const body = await readBody(req);
                if (typeof body.title !== "string" || body.title.trim().length === 0 || body.title.length > 256) { json(res, 400, { error: "제목은 1~256자로 입력해주세요." }); return; }
                if (typeof body.content !== "string" || body.content.trim().length === 0 || body.content.length > 4096) { json(res, 400, { error: "내용은 1~4096자로 입력해주세요." }); return; }
                const channel = client.channels.cache.get(String(body.channelId));
                if (!channel || !channel.isTextBased() || !("send" in channel)) { json(res, 400, { error: "유효한 텍스트 채널이 아닙니다." }); return; }
                const normalizedColor = typeof body.color === "string" ? body.color.trim().replace(/^#/, "") : "5865F2";
                if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) { json(res, 400, { error: "색상은 6자리 HEX 형식이어야 합니다." }); return; }
                const isUrl = (value: unknown) => !value || (typeof value === "string" && /^https?:\\/\\//i.test(value));
                if (!isUrl(body.thumbnail) || !isUrl(body.image)) { json(res, 400, { error: "이미지 URL은 http 또는 https만 사용할 수 있습니다." }); return; }
                const embed: any = { title: body.title, description: body.content, color: Number.parseInt(normalizedColor, 16) };
                if (body.thumbnail) embed.thumbnail = { url: body.thumbnail };
                if (body.image) embed.image = { url: body.image };
                if (body.footer) embed.footer = { text: String(body.footer).slice(0, 2048) };
                await channel.send({ embeds: [embed] });
                json(res, 200, { ok: true });
                return;
            }
            json(res, 404, { error: "Not Found" });
        } catch (error) {
            console.error("[웹 패널] 오류:", error);
            json(res, 500, { error: "요청 처리 중 오류가 발생했습니다." });
        }
    });
    server.listen(port, "0.0.0.0", () => console.log(`🌐 관리자 패널: http://0.0.0.0:${port}/admin`));
}
