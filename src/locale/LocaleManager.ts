// LocaleManager.ts - Locales (noud02)

import * as fs from "fs";
import * as i18next from "i18next";
import * as i18backend from "i18next-node-fs-backend";
import * as path from "path";

export class LocaleManager {

    public t: i18next.TranslationFunction;

    public init (): Promise<i18next.TranslationFunction> {
        return new Promise((resolve, reject) => {
            const opts: i18nextNodeFsBackEnd.i18nextNodeFsBackEndOptions = {
                addPath: "../../i18n/{{lng}}/{{ns}}.missing.json",
                jsonIndent: 4,
                loadPath: "../../i18n/{{lng}}/{{ns}}.json",
            };

            const langs: string[] = [];

            for (const dir of fs.readdirSync(path.join(__dirname, "..", "..", "i18n/"))) {
                if (fs.statSync(path.join(__dirname, "..", "..", "i18n", dir)).isDirectory()) {
                    langs.push(dir);
                }
            }

            i18next.use(i18backend).init({
                backend: opts,
                fallbackLng: "en",
                lng: "en",
                load: "all",
                preload: langs,
            }, (err: Error, t: i18next.TranslationFunction) => {
                if (err) {
                    return reject(err);
                }
                this.t = t;

                return resolve(t);
            });
        });
    }

    public reload (): Promise<void> {
        return new Promise((resolve, reject) => {
            i18next.reloadResources();
            i18next.on("loaded", resolve);
            i18next.on("failedLoading", reject);
        });
    }

}
