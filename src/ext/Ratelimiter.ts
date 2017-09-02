// Ratelimiter.ts - cuz b1nzy (noud02)

/**
 * Ratelimiter bucket
 *
 * @export
 * @class Ratelimiter
 */
export class Ratelimiter {

    /**
     * If the bucket is soft ratelimited or not
     *
     * @type {boolean}
     */
    public soft: boolean = false;
    /**
     * If the warning was sent
     *
     * @type {boolean}
     */
    public sentWarn: boolean = false;
    /**
     * Last use (timestamp)
     *
     * @type {number}
     */
    public lastUse: number = 0;
    /**
     * Uses
     *
     * @type {number}
     */
    public uses: number = 0;
    /**
     * Bucket reset interval
     *
     * @type {NodeJS.Timer}
     */
    public interval: NodeJS.Timer = setInterval(() => { this.uses = 0; this.sentWarn = false; this.soft = false; }, this.time);

    constructor (public max: number = 10, public time: number = 10000) {}

    /**
     * Use the bucket
     *
     * @returns {string}
     */
    public use (): string {
        if (this.uses < this.max) {
            this.uses++;
            if (this.lastUse !== 0 ? (this.lastUse + this.time / 2) - Date.now() <= 0 : true) {
                this.soft = false;
                this.lastUse = Date.now();

                return "OK";
            } else {
                this.soft = true;

                return "RATELIMITED";
            }
        }

        this.lastUse = Date.now();

        return "RATELIMITED";
    }

}
