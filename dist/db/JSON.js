"use strict";
// JSON.ts - JSONDB meme (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
/**
 * meme
 *
 */
class JSONDB {
    /**
     * Creates an instance of JSONDB.
     * @param {string} dir
     */
    constructor(dir) {
        this.dir = dir;
    }
    /**
     * Initializes the JSON database
     *
     * @returns {Promise<void>}
     */
    init() {
        if (fs.existsSync(this.dir)) {
            return Promise.resolve();
        }
        else {
            return Promise.reject(new Error("Directory not found"));
        }
    }
}
exports.JSONDB = JSONDB;
