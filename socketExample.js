// 1. npm install
// 2. npm run socket-example

const socketCluster = require('socketcluster-client');

const exchange = 'BINA';
const markets = [
    'BTC_USDT',
    'ETH_USDT',
    'ETH_BTC',
];
const timeFrame = 10; // sec.
const options = {
    hostname  : "ws.upwingo.com",
    port      : "443",
    secure    : "true"
};

const conn = socketCluster.connect(options);

conn.on('connect', (status) => {
    console.log(status);

    conn.on('error', (err) => {
        console.error(err);
    });

    // candles channel
    // CANDLES--{EXCHANGE}-{SYMBOL}--{TIMEFRAME} - channel template
    markets.forEach((market) => {
        let channelName = `CANDLES--${exchange}-${market}--${timeFrame}`;
        conn.subscribe(channelName).watch((data) => {
            let candles = data.candles || [];
            candles.forEach((candle) => {
                candle = candle.split(',')
                console.log("dateTime=%s open=%s high=%s low=%s close=%s vol=%s",
                new Date(candle[0] * 1000).toUTCString(), candle[1], candle[2], candle[3], candle[4], candle[5])
            })
        })
    });

    // history channel
    conn.emit('candles.history', {
        exchange: exchange,
        pair: markets[0],
        interval: timeFrame,
        start: 0,   // timestamp
        end: 0,     // timestamp
    }, (err, history) => {
        if (err) {
            console.error(err)
        } else {
            console.log(history);
        }
    });

    // changeRound channel
    conn.subscribe('changeRound').watch((resp) => {
       console.log(resp);
    });
});

conn.on('disconnect', () => {
    console.log('disconnect')
});

conn.on('kickOut', () => {
    console.log('kickOut')
});

conn.on('connectAbort', () => {
    console.log('abort')
});

conn.on('close', () => {
    console.log('close')
});

conn.on('disconnect', () => {
    console.log('disconnect')
});


setTimeout(() => {
    conn.disconnect()
}, 15000);
