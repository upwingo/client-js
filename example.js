const Upwingo = require("./src/Upwingo/Upwingo");
const BotSimple = require("./src/Bots/Simple");

const upwingo = new Upwingo({
    api_key: "XXX"
});

new BotSimple(
    upwingo,
    "bina", "btc_usdt", 10, "micro", "FREE", 10.0
).run();
