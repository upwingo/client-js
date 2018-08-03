function BotSimple(upwingo) {

    const log = (message) => {
        console.log("%s: %s", new Date().toUTCString(), message);
    };

    const onTick = (data) => {
        let candles = data.candles || [];
        candles.forEach((candle) => {
            candle = candle.split(',').map(s => s.trim());
            log(JSON.stringify(candle));
        })
    };

    this.run = () => {
        upwingo.ticker("CANDLES--BINA-BTC_USDT--10", onTick, true);
    };
}

module.exports = BotSimple;