// Type definitions for sanic
// Definitions by: noud02 <https://github.com/noud02>

declare module "sanic" {
    const sanic: (generator: (...args: any[]) => IterableIterator<any>) => (...args: any[]) => Promise<any>;
    export = sanic;
}