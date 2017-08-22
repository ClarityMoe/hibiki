// Constants.js - Constant variables (noud02)

/**
 * WebSocket OP codes
 *
 * @export
 * @interface IOPCodes
 */
export interface IOPCodes {
    EVENT: number;
    HEARTBEAT: number;
    MESSAGE: number;
    REQUEST: number;
    RESPONSE: number;
    UPDATE: number;
}

export const OPCodes: IOPCodes = {
    EVENT: 0,
    HEARTBEAT: 1,
    MESSAGE: 2,
    REQUEST: 3,
    RESPONSE: 4,
    UPDATE: 5,
};
