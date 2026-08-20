# Discord.js 고급 감사 로그 봇 템플릿

이 리포지토리는 Discord.js(v14)와 TypeScript로 만든 **모듈형 로깅 봇 템플릿**입니다. 서버의 거의 모든 활동을 로깅할 수 있으며, 관리자는 모든 로깅 이벤트를 개별적으로 켜고 끌 수 있습니다.

## 주요 기능
- **Discord.js v14** 기반, 모든 Partials 활성화
- **23가지 이벤트** 로깅 지원 (메시지, 멤버, 채널, 역할, 음성, 초대, 이모지, 스티커)
- **개별 이벤트 On/Off 기능** - 원하는 이벤트만 활성화
- **슬래시 커맨드**로 모든 설정 관리
- **데이터베이스 불필요** - `config.json` 파일 기반 설정 저장
- TypeScript 기반 구조로 타입 안정성 보장

## 지원 로깅 이벤트

### 메시지 (Messages)
- `messageDelete` - 메시지 삭제
- `messageUpdate` - 메시지 수정 (수정 전/후 내용 포함)
- `messageDeleteBulk` - 메시지 대량 삭제

### 멤버 (Members)
- `memberJoin` - 멤버 입장
- `memberLeave` - 멤버 퇴장/킥/밴
- `memberUpdate` - 닉네임 변경, 역할 추가/제거
- `memberBan` - 멤버 밴
- `memberUnban` - 멤버 언밴

### 채널 (Channels)
- `channelCreate` - 채널 생성
- `channelDelete` - 채널 삭제
- `channelUpdate` - 채널 설정 변경 (이름, 토픽 등)

### 역할 (Roles)
- `roleCreate` - 역할 생성
- `roleDelete` - 역할 삭제
- `roleUpdate` - 역할 설정 변경 (이름, 권한 등)

### 음성 (Voice)
- `voiceStateUpdate` - 음성 채널 입장/퇴장/이동

### 초대 (Invites)
- `inviteCreate` - 초대 링크 생성 (생성자, 기간, 최대 사용 횟수)
- `inviteDelete` - 초대 링크 삭제

### 표현 (Expressions)
- `emojiCreate` - 이모지 생성
- `emojiDelete` - 이모지 삭제
- `emojiUpdate` - 이모지 수정
- `stickerCreate` - 스티커 생성
- `stickerDelete` - 스티커 삭제
- `stickerUpdate` - 스티커 수정

## 요구사항
- Node.js 18 이상 권장
- npm
- Discord 봇 토큰 및 클라이언트 ID

## 빠른 시작

### 1. 리포지토리 복제

```bash
git clone <your-repo-url>
cd template-logger
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 다음 값을 채우세요:

```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
```

### 4. 봇 권한 설정

Discord Developer Portal에서 봇에 다음 권한을 부여하세요:
- **Intents (필수):**
  - Guilds
  - Guild Members (Privileged Intent 활성화 필요)
  - Guild Messages
  - Guild Voice States
  - Guild Bans
  - Guild Emojis and Stickers
  - Guild Invites
  - Message Content (Privileged Intent 활성화 필요)

- **Bot Permissions:**
  - View Channels
  - Send Messages
  - Embed Links
  - Read Message History
  - View Audit Log (선택사항, 더 상세한 로깅에 필요)

### 5. 개발 모드로 실행

```bash
npm run dev
```

### 6. 빌드 및 시작 (프로덕션)

```bash
npm run build
npm start
```

## 사용 방법

### 1단계: 로그 채널 설정

먼저 로그를 받을 채널을 설정합니다:

```
/로그-설정 채널 [채널]
```

예시: `/로그-설정 채널 #로그채널`

이 명령어를 실행하면 서버의 기본 설정이 생성되며, 모든 이벤트는 기본적으로 비활성화 상태입니다.

### 2단계: 원하는 이벤트 활성화

필요한 이벤트만 선택적으로 활성화합니다:

```
/로그-설정 켜기 [이벤트]
```

예시:
- `/로그-설정 켜기 메시지 삭제 (messageDelete)`
- `/로그-설정 켜기 멤버 입장 (memberJoin)`
- `/로그-설정 켜기 음성 상태 변경 (voiceStateUpdate)`

### 3단계: 이벤트 비활성화 (선택사항)

더 이상 필요하지 않은 이벤트를 비활성화합니다:

```
/로그-설정 끄기 [이벤트]
```

예시: `/로그-설정 끄기 메시지 수정 (messageUpdate)`

### 4단계: 현재 설정 확인

현재 로그 설정 상태를 확인합니다:

```
/로그-설정 확인
```

이 명령어는 현재 설정된 로그 채널과 모든 이벤트의 On/Off 상태를 보여줍니다.

## 설정 파일

모든 설정은 프로젝트 루트의 `config.json` 파일에 저장됩니다. 파일 구조는 다음과 같습니다:

```json
{
  "서버ID": {
    "logChannel": "채널ID",
    "toggles": {
      "messageDelete": false,
      "messageUpdate": false,
      "memberJoin": true,
      "memberLeave": true,
      ...
    }
  }
}
```

> **주의:** `config.json` 파일을 직접 수정하는 대신 슬래시 커맨드를 사용하는 것을 권장합니다.

## 프로젝트 구조

```
src/
  config.ts              # 환경변수 로드 및 검증
  deploy-commands.ts     # 슬래시 커맨드 배포 스크립트
  index.ts               # 엔트리 포인트 (모든 이벤트 리스너 등록)
  scheduler.ts           # 스케줄러 예시
  commands/              # 커맨드 정의 폴더
    log-settings.ts      # 로그 설정 명령어
    ping.ts
    index.ts             # 커맨드 로더
  events/                # 이벤트 핸들러
    messageDelete.ts
    messageUpdate.ts
    messageDeleteBulk.ts
    guildMemberAdd.ts
    guildMemberRemove.ts
    guildMemberUpdate.ts
    guildBanAdd.ts
    guildBanRemove.ts
    channelCreate.ts
    channelDelete.ts
    channelUpdate.ts
    roleCreate.ts
    roleDelete.ts
    roleUpdate.ts
    voiceStateUpdate.ts
    inviteCreate.ts
    inviteDelete.ts
    emojiCreate.ts
    emojiDelete.ts
    emojiUpdate.ts
    stickerCreate.ts
    stickerDelete.ts
    stickerUpdate.ts
  utils/                 # 유틸리티 모듈
    configManager.ts     # config.json 관리
config.json              # 서버별 로그 설정 (자동 생성)
```

## 슬래시 커맨드 배포

개발 시 TypeScript 파일을 직접 실행하려면 `tsx`를 사용합니다:

```bash
npx tsx src/deploy-commands.ts
```

프로덕션 환경에서는 먼저 빌드한 뒤 dist 파일을 실행하세요:

```bash
npm run build
node dist/deploy-commands.js
```

## 보안 및 권한

- `/로그-설정` 명령어는 **관리자 권한**(Administrator)이 있는 사용자만 실행할 수 있습니다.
- 모든 설정은 서버(Guild) 단위로 독립적으로 관리됩니다.
- `config.json` 파일에는 민감한 정보가 포함되지 않지만, 서버 설정 정보가 포함되므로 주의하여 관리하세요.

## 커스터마이징

### 새로운 이벤트 추가

1. `src/events/` 폴더에 새 이벤트 핸들러 파일 생성
2. `src/utils/configManager.ts`의 `GuildConfig` 인터페이스에 토글 추가
3. `src/commands/log-settings.ts`의 `EVENT_CHOICES` 배열에 선택지 추가
4. `src/index.ts`에서 이벤트 리스너 등록

### 로그 메시지 커스터마이징

각 이벤트 핸들러 파일(`src/events/`)에서 임베드 메시지를 자유롭게 수정할 수 있습니다.

## 문제 해결

### 봇이 이벤트를 감지하지 못함
- Discord Developer Portal에서 Privileged Intents가 활성화되어 있는지 확인하세요.
- 특히 `Guild Members Intent`와 `Message Content Intent`가 필요합니다.

### 로그가 채널에 전송되지 않음
- `/로그-설정 확인` 명령어로 이벤트가 활성화되어 있는지 확인하세요.
- 봇이 로그 채널에 메시지를 보낼 권한이 있는지 확인하세요.

### 슬래시 커맨드가 표시되지 않음
- `npm run build && node dist/deploy-commands.js`를 실행하여 명령어를 재배포하세요.
- Discord 앱을 재시작하거나 서버를 나갔다가 다시 들어오세요.

## 출처(Attribution)

이 프로젝트는 dishostkr/template-djs-boilerplate를 기반으로 합니다 (https://github.com/dishostkr/template-djs-boilerplate)

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 리포지토리 루트의 `LICENSE` 파일을 확인하세요.
