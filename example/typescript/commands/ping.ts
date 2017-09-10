import * as Eris from "eris";
import * as Hibiki from "../../../";

@Hibiki.ext.command("ping")
@Hibiki.ext.description("pong!")
class Ping extends Hibiki.Command {
    public run (ctx: Hibiki.Context): Promise<Eris.Message> {
        return ctx.send("Pong!");
    }
}

export = Ping;
