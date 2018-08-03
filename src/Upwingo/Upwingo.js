const socketCluster = require("socketcluster-client");
const fetch = require('node-fetch');

class Upwingo {

    /**
     * @param config
     */
    constructor(config = {}) {
        this._config = {
            ws_host: "ws.upwingo.com",
            ws_port: 443,
            ws_secure: true,
            host: "api.upwingo.com",
            secure: true,
            api_key: ""
        };

        for (let key in config) {
            if (config.hasOwnProperty(key)) {
                this._config[key] = config[key];
            }
        }
    }

    /**
     * @param channels
     * @param onTick
     * @param reconnect
     */
    ticker (channels, onTick, reconnect = false) {
        let active = true;

        const conn = socketCluster.connect({
            hostname: this._config.ws_host,
            port: this._config.ws_port,
            secure: this._config.secure
        });

        const re = () => {
            if (!reconnect || !active) {
                return;
            }

            console.log("%s: upwingo: wait for reconnect")

            setTimeout(() => {
                try {
                    conn.connect();
                } catch (e) {
                    // ignore
                }
            }, 30000);
        };

        conn.on("connect", () => {
            if (typeof channels.forEach === 'undefined') {
                channels = [channels];
            }

            channels.forEach((channel) => {
                conn.subscribe(channel).watch((data) => {
                    if (onTick(data) === false) {
                        active = false;
                        conn.disconnect();
                    }
                });
            });
        });

        conn.on("error", (err) => {
            console.error("%s: upwingo: %s", new Date().toUTCString(), err.message);
        });

        conn.on("disconnect", () => {
            console.log("%s: upwingo: disconnect", new Date().toUTCString());
            re()
        });

        conn.on("kickOut", () => {
            console.log("%s: upwingo: kickOut", new Date().toUTCString());
            re();
        });

        conn.on("connectAbort", () => {
            console.log("%s: upwingo: abort", new Date().toUTCString());
            re();
        });

        conn.on("close", () => {
            console.log("%s: upwingo: close", new Date().toUTCString());
        });
    }

    /**
     * @returns {Promise}
     */
    getTablesList() {
        return this.fetch("/v1/binary/tables");
    }

    /**
     * @param params
     * @returns {Promise}
     */
    getNextRoundInfo(params) {
        return this.fetch("/v1/binary/round", "GET", params);
    }

    /**
     * @param params
     * @returns {Promise}
     */
    getHistory(params) {
        return this.fetch("/v1/binary/history", "GET", params);
    }

    /**
     * @param params
     * @returns {Promise}
     */
    orderCreate(params) {
        return this.fetch("/v1/binary/order", "POST", params);
    }

    /**
     *
     * @param orderId
     * @returns {Promise}
     */
    orderCancel(orderId) {
        return this.fetch(`/v1/binary/order/${orderId}/cancel`, "POST");
    }

    /**
     * @returns {Promise}
     */
    getBalance() {
        return this.fetch("/v1/balance");
    }

    /**
     * @param url
     * @param method
     * @param params
     * @returns {Promise}
     */
    fetch(url, method = "GET", params = {}) {
        url = (this._config.secure ? "https://" : 'http://') + this._config.host + url;

        let options = {
            method: method,
            headers: {
                "Authorization": `Bearer ${this._config.api_key}`
            }
        };

        if (method === "GET") {
            let query = [];
            for (let key in params) {
                if (params.hasOwnProperty(key)) {
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                }
            }

            if (query.length) {
                url += "?" + query.join("&");
            }
        } else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(params);
        }

        return fetch(url, options).then(data => data.json()).then((data) => {
            if (data.code !== 200) {
                throw new Error(`Code ${data.code}: ` + JSON.stringify(data));
            }

            return data;
        });
    }
}

module.exports = Upwingo;