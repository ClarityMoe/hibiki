// RethinkDB.ts - RethinkDB implementation if you don't want SQL (Capuccino@ClaraIO)

/** @todo complete this */
import * as rt from "rethinkdbdash";

export class RethinkDB {
    public client : rt = newrt (this.options);
    constructor( private options: rt.options) {};
}