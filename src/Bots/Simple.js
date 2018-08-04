const Candle = require("../Tools/Candle");

function BotSimple(upwingo, exchange, symbol, timeframe, limit, currency, amount) {

    currency = currency.toUpperCase();
    timeframe = parseInt(timeframe);
    amount = parseFloat(amount);

    const channel = `CANDLES--${exchange}-${symbol}--${timeframe}`.toUpperCase();
    const tableId = `${exchange}--${symbol}--${timeframe}--${limit}--single:`.toLowerCase() + currency + "--pvp";

    let balance = 0.0;


    //
    //                    up | up | -> | up
    //                down | down | -> | down
    //
    //          up | up | up | up | -> | down
    //  down | down | down | down | -> | up
    //
    const condition = (function () {
        const CAP = 5;
        const TREND = 2;
        const POINT = 0.00000001;

        const candles = {};
        let currentCandleTime = 0;
        let lastOrderCandleTime = 0;

        const updateCandles = (data) => {
            (data["candles"] || []).forEach((csv) => {
                const candle = new Candle(csv);
                if (!candle.isComplete()) {
                    return;
                }

                candles[candle.time] = candle;

                if (candle.time > currentCandleTime) {
                    currentCandleTime = candle.time;
                }
            });

            for (let time in candles) {
                if (candles.hasOwnProperty(time)) {
                    if (candles[time].time <= currentCandleTime - CAP*timeframe) {
                        delete candles[time];
                    }
                }
            }
        };

        return (data) => {
            updateCandles(data);

            if (currentCandleTime <= lastOrderCandleTime) {
                return 0;
            }

            let time = currentCandleTime - timeframe;
            const candle = candles[time];
            if (!candle) {
                return 0;
            }

            const diff = candle.close - candle.open;
            if (Math.abs(diff) < POINT) {
                return 0;
            }

            let dir = 1;
            if (diff < 0) {
                dir = -1;
            }

            const command = (() => {
                let command = 0;

                for (let i = 2; i < CAP; ++i) {
                    time -= timeframe;
                    const candle = candles[time];
                    if (!candle) {
                        return command;
                    }

                    if ( (candle.close - candle.open)*dir < POINT ) {
                        return command;
                    }

                    if (i === TREND) {
                        command = dir;
                    }
                }

                command = -command;

                return command;
            })();

            if (command) {
                lastOrderCandleTime = currentCandleTime;
            }

            return command;
        };

    })();


    const log = (message) => {
        console.log("%s: %s", new Date().toUTCString(), message);
    };

    const getBalanceValue = (data) => {
        data = data || {};
        data = data["FREE"] || {};
        return parseFloat(data[currency]) || 0.0;
    };

    const onTick = (data) => {
        if (amount > balance) {
            log("insufficient funds");
            return false;
        }

        const type = condition(data);
        if (!type) {
            return;
        }

        const order = {
            table_id: tableId,
            amount: amount,
            currency: currency,
            type: type
        };

        upwingo.orderCreate(order).then((data) => {
            balance = getBalanceValue(data["balance"]);

            const orderId = (data["data"] || {})["order_id"] || "";
            log(`order ${orderId} created ${JSON.stringify(order)} balance: ${balance}`);

        }).catch((err) => {
            log(err.message);
        });
    };


    this.run = () => {
        upwingo.getBalance().then((data) => {
            balance = getBalanceValue(data["data"]);
            log("balance: " + balance);

            upwingo.ticker(channel, onTick);

        }).catch((err) => {
            log(err.message);
        });
    };
}

module.exports = BotSimple;