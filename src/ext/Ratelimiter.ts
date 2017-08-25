// Ratelimiter.ts - b1nzy (noud02)

export class Ratelimiter {

    public soft: boolean = false;
    public sentWarn: boolean = false;
    public lastUse: number = 0;
    public uses: number = 0;
    public interval: any = setInterval(() => { this.uses = 0; this.sentWarn = false; this.soft = false; }, this.time);

    constructor (public max: number = 10, public time: number = 10000) {}

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
