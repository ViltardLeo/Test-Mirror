class PlayerManager {
    constructor() {
        this.players = {};
        this.logger = require('../logging').logger.child({ serviceName: 'PlayerManager' });
    };

    addPlayer(socket) {
        this.logger.info(`Client ${socket.remoteAddress}:${socket.remotePort} added`);
        this.players[socket] = {
            "isAuth": false,
            "conn_date": new Date()
        };
    };

    kickNonAuth() {
        for (const [key, value] of Object.entries(this.players)) {
            if (value.isAuth === false && new Date() - value.conn_date > 5000) {
                this.removePlayer(key);
            }
        }
    };

    removePlayer(socket){
        socket.end();
        delete this.players[socket];

        this.logger.info(`Client ${socket.remoteAddress}:${socket.remotePort} removed`);
    };

    setAuthPlayer(socket) {
        this.players[socket].isAuth = true;
        this.logger.info (`Client ${socket.remoteAddress}:${socket.remotePort} authenticated`);
    };

    isAuth(key) {
        if (key in this.players)
            return this.players[key].isAuth;
        return false;
    };
}

const instance = new PlayerManager();

setInterval(instance.kickNonAuth.bind(instance), 1000);

module.exports = instance;
