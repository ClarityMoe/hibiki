import { constructor as Chalk } from "chalk";
import * as moment from "moment";
import { Shard } from "./Shard";

export interface ILoggerOptions {
    prefix?: string;
    debug?: boolean;
}

export class Logger {

    private options: ILoggerOptions;
    private shard: Shard;
    private clk: Chalk = new Chalk({ enabled: true });

    constructor(obj: Shard | ILoggerOptions) {
        if (obj instanceof Shard) {
            this.shard = obj;
            this.options = obj.options.logger; :
            this.prefix = "SHARD";
        } else {
            this.options = obj;
            this.prefix = obj.prefix;
        }
    }

    private getPrefix(): string {
        switch (this.prefix.toLowerCase()) {
            case "main":
                return clk.blue(this.prefix);
            case "core":
                return clk.pink(this.prefix);
            default:
                return clk.yellow(this.prefix);
        }
    }

    private getTime(num: number): string {
        const date: string = this.clk.cyan(moment(num).format("l"));
        const time: string = this.clk.cyan(moment(num).format("hh:MM:SS"));
        const p: (str: string) => string = (str: string) => this.clk.purple.bold(str);
        return `${p("[")} ${date} ${p("@")} ${time} ${p("]")}`;
    }

    private getLabel(type: string): string {
        switch (type) {
            case "info":
                return this.clk.bgPurple(" INFO ");
            case "ok":
                return this.clk.bgGreen(" OK ");
            case "fail":
                return this.clk.bgRed(" FAIL ");
            case "err":
                return this.clk.bgRed(" ERR ");
            case "log":
            default:
                return this.clk.black.bgWhite(" LOG ");
        }
    }

    private logBase(date: number, type: string, args: any[], error?: boolean): any {
        const orefix = this.getPrefix();
        const time = this.getTime(date);
        const label = this.getLabel(type);

        return console[error && "error" || "log"](prefix, time, label, args.join(" "));
    }

    private checkArgs(args: any[]): Promise<void> {
        for (const arg of args) {
            if (arg instanceof Error) {
                return Promise.rejectp(new Error("Logging errors under non-error types is NOT allowed!"));
            }
        }

        return Promise.resolve();
    }

    public log(): Promise<void> {
        const date: number = Date.now();
        return new Promise((resolve, reject) => {
            const args: any[] = Array.from(arguments);

            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "log", args, false));
        });
    }

    public info(): Promise<void> {
        const date: number = Date.now();
        return new Promise((resolve, reject) => {
            const args: any[] = Array.from(arguments);

            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "info", args, false));
        });
    }

    public ok(): Promise<void> {
        const date: number = Date.now();
        return new Promise((resolve, reject) => {
            const args: any[] = Array.from(arguments);

            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "ok", args, false));
        });
    }

    public fail(): Promise<void> {
        const date: number = Date.now();
        return new Promise((resolve, reject) => {
            const args: any[] = Array.from(arguments);
            return resolve(this.logBase(date, "fail", args, true));
        });
    }

    public err(): Promise<void> {
        const date: number = Date.now();
        return new Promise((resolve, reject) => {
            const args: any[] = Array.from(arguments);
            return resolve(this.logBase(date, "err", args, true));
        });
    }

}
