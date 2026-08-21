import * as ping from "./ping";
import * as logSettings from "./log-settings";
import * as welcomeSetup from "./welcome/welcome-setup";
import * as leaveSetup from "./welcome/leave-setup";
import * as reactionRoleAdd from "./roles/reaction-role-add";
import * as reactionRoleRemove from "./roles/reaction-role-remove";
import * as reactionRoleList from "./roles/reaction-role-list";
import * as reactionRolePanel from "./roles/reaction-role-panel";
import * as purge from "./moderation/purge";
import * as kick from "./moderation/kick";
import * as ban from "./moderation/ban";
import * as ticket from "./ticket";
import * as ticketSetup from "./ticket-setup";
import * as giveaway from "./giveaway";
import * as message from "./message";
import * as embed from "./embed";

export const commands = {
    ping,
    "로그-설정": logSettings,
    "welcome-setup": welcomeSetup,
    "leave-setup": leaveSetup,
    "reaction-role-add": reactionRoleAdd,
    "reaction-role-remove": reactionRoleRemove,
    "reaction-role-list": reactionRoleList,
    "reaction-role-panel": reactionRolePanel,
    purge,
    kick,
    ban,
    ticket,
    "ticket-setup": ticketSetup,
    giveaway,
    message,
    embed,
};
