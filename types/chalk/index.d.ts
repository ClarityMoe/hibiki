// Type definitions for chalk v2.1.0
// Project: https://github.com/sindresorhus/chalk
// Definitions by: Diullei Gomes <https://github.com/Diullei>, Bart van der Schoor <https://github.com/Bartvds>, Nico Jansen <https://github.com/nicojs>, Noud Kerver <https://github.com/noud02>
// Definitions: https://github.com/ClarityMoe/hibiki

declare module "chalk" {
    export = Chalk;

    function Chalk (strs: TemplateStringsArray): string;

    namespace Chalk {
        export const enabled: boolean;
        export const supportsColor: boolean;

        export function stripColor(value: string): any;
        export function hasColor(str: string): boolean;

        export interface ChalkChain extends ChalkStyle {
            (): boolean;
            (...text: string[]): string;
        }

        export interface ChalkStyleElement {
            open: string;
            close: string;
        }

        // General
        export const reset: ChalkChain;
        export const bold: ChalkChain;
        export const dim: ChalkChain;
        export const italic: ChalkChain;
        export const underline: ChalkChain;
        export const inverse: ChalkChain;
        export const hidden: ChalkChain;
        export const strikethrough: ChalkChain;

        // Text colors
        export const black: ChalkChain;
        export const red: ChalkChain;
        export const green: ChalkChain;
        export const yellow: ChalkChain;
        export const blue: ChalkChain;
        export const magenta: ChalkChain;
        export const cyan: ChalkChain;
        export const white: ChalkChain;
        export const gray: ChalkChain;
        export const grey: ChalkChain;

        // Background colors
        export const bgBlack: ChalkChain;
        export const bgRed: ChalkChain;
        export const bgGreen: ChalkChain;
        export const bgYellow: ChalkChain;
        export const bgBlue: ChalkChain;
        export const bgMagenta: ChalkChain;
        export const bgCyan: ChalkChain;
        export const bgWhite: ChalkChain;


        export interface ChalkStyle {
            // General
            reset: ChalkChain;
            bold: ChalkChain;
            dim: ChalkChain;
            italic: ChalkChain;
            underline: ChalkChain;
            inverse: ChalkChain;
            hidden: ChalkChain;
            strikethrough: ChalkChain;

            // Text colors
            black: ChalkChain;
            red: ChalkChain;
            green: ChalkChain;
            yellow: ChalkChain;
            blue: ChalkChain;
            magenta: ChalkChain;
            cyan: ChalkChain;
            white: ChalkChain;
            gray: ChalkChain;
            grey: ChalkChain;

            // Background colors
            bgBlack: ChalkChain;
            bgRed: ChalkChain;
            bgGreen: ChalkChain;
            bgYellow: ChalkChain;
            bgBlue: ChalkChain;
            bgMagenta: ChalkChain;
            bgCyan: ChalkChain;
            bgWhite: ChalkChain;
        }

        export const constructor: {
            new (options: {enabled: boolean}): Chalk;
        }

        export interface Chalk extends ChalkStyle {
            enabled: boolean;
        }
    }
}