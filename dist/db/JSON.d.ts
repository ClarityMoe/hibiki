/**
 * meme
 *
 * @export
 * @class JSONDB
 */
export declare class JSONDB {
    private dir;
    /**
     * Creates an instance of JSONDB.
     * @param {string} dir
     * @memberof JSONDB
     */
    constructor(dir: string);
    /**
     * Initializes the JSON database
     *
     * @returns {Promise<void>}
     * @memberof JSONDB
     */
    init(): Promise<void>;
}
