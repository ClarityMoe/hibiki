// Type defenitions for blocked v1.2.1
// Project: https://github.com/tj/node-blocked
// Definitions by: Noud Kerver <https://github.com/noud02>
// Definitions: https://github.com/ClarityMoe/hibiki

declare module "blocked" {
    const blocked: (fn: (n: number) => void) => NodeJS.Timer;
    export = blocked;
}