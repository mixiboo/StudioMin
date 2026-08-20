"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.Localization = void 0;
const ko_json_1 = __importDefault(require("../locales/ko.json"));
class Localization {
    static get(key, replacements) {
        const keys = key.split('.');
        let value = this.locale;
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                return key;
            }
        }
        if (typeof value !== 'string') {
            return key;
        }
        if (replacements) {
            return Object.entries(replacements).reduce((str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v), value);
        }
        return value;
    }
}
exports.Localization = Localization;
_a = Localization;
Localization.locale = ko_json_1.default;
Localization.t = _a.get;
exports.t = Localization.get.bind(Localization);
