function BotTemplate(upwingo) {

    const channels = [];

    const onTick = (data) => {
        // TODO: Implement onTick() function
    };

    this.run = () => {
        // TODO: Implement run() function

        upwingo.ticker(channels, onTick);
    };
}

module.exports = BotTemplate;