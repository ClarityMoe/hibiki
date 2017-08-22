// JSON.ts - JSONDB meme (noud02)

import * as fs from "fs";

/**
 * meme
 *
 */
export class JSONDB {

    /**
     * Creates an instance of JSONDB.
     * @param {string} dir
     */
    constructor (private dir: string) {}

    /**
     * Initializes the JSON database
     *
     * @returns {Promise<void>}
     */
    public init (): Promise<void> {
        if (fs.existsSync(this.dir)) {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error("Directory not found"));
        }
    }

}
