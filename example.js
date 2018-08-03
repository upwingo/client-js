const Upwingo = require("./src/Upwingo/Upwingo");
const BotSimple = require("./src/Bots/Simple");

upwingo = new Upwingo({
    api_key: "XXX"
});

new BotSimple(upwingo).run();
