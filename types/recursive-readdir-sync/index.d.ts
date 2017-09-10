// Type defenitions for recursive-readdir-sync v1.0.6
// Project: https://github.com/battlejj/recursive-readdir-sync
// Definitions by: Noud Kerver <https://github.com/noud02>
// Definitions: https://github.com/ClarityMoe/hibiki

declare module "recursive-readdir-sync" {
    const rreaddirSync: (path: string) => string[];
    export = rreaddirSync;
}