function Candle(csv) {
    let candle = csv.split(',').map(s => s.trim());

    this.time = parseInt(candle[0]) || 0;
    this.open = parseFloat(candle[1]) || 0.0;
    this.high = parseFloat(candle[2]) || 0.0;
    this.low = parseFloat(candle[3]) || 0.0;
    this.close = parseFloat(candle[4]) || 0.0;
    this.volume = parseFloat(candle[5]) || 0.0;
}

Candle.prototype.isComplete = function() {
    return this.time > 0 &&
        this.open > 0.0 &&
        this.high > 0.0 &&
        this.low > 0.0 &&
        this.close > 0.0 &&
        this.volume >= 0.0;
};

module.exports = Candle;