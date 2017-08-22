/**
 * meme
 *
 */
export declare class JSONDB {
    private dir;
    /**
     * Creates an instance of JSONDB.
     * @param {string} dir
     */
    constructor(dir: string);
    /**
     * Initializes the JSON database
     *
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
}
