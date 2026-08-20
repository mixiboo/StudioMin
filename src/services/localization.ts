import koLocale from '../locales/ko.json';

type LocaleData = typeof koLocale;

export class Localization {
    private static locale: LocaleData = koLocale;

    static get(key: string, replacements?: Record<string, string>): string {
        const keys = key.split('.');
        let value: any = this.locale;

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
            return Object.entries(replacements).reduce(
                (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
                value
            );
        }

        return value;
    }

    static t = this.get;
}

export const t = Localization.get.bind(Localization);
