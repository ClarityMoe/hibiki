import * as redis from "redis";
import { Shard } from "../client/Shard";

export class Redis {

    private client: redis.RedisClient;

    constructor(private shard: Shard, private options: redis.ClientOpts) {}

    public connect(): Promise<void> {
        this.client = redis.createClient(this.options);
        return Promise.resolve();
    }

    public set(key: string, value: Object): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (err: Error, res: any) => {
                if (err) {
                    return reject(err);
                }

                return resolve(res);
            });
        });
    }

    public get(key: string): Promise<Object> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err: Error, res: string) => {
                if (err) {
                    return reject(err);
                }

                return resolve(JSON.parse(res));
            });
        });
    }
}
