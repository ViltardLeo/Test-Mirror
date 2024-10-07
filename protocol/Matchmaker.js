const axios = require("axios");
const MAX_PLAYER_PER_GAME = 2;
const MAX_PER_SUBQUEUE = 3;
const logger = require('../logging').logger.child({ serviceName: 'Matchmaker' });

if (!process.env.EDGEGAP_TOKEN) {
    logger.error( "Missing environment key: EDGEGAP_TOKEN");
    process.exit(84);
}

class Matchmaker {

    constructor() {
        this.waitingList = [];
    };

    addToWaitingList(socket) {
        this.waitingList.push(socket);
        this.checkForMatches();
    };

    removeFromWaitingList(socket) {
        const index = this.waitingList.indexOf(socket)
        if (index !== -1)
            this.waitingList.splice(index, 1)
    }

    async checkForMatches() {
        if (this.waitingList.length < MAX_PLAYER_PER_GAME)
            return;

        // const groups = this.formGroups();
        // const queues = this.splitList(groups);
        // const tasks = queues.map(this.createSessions);
        // const result = await Promise.all(tasks);
    };

    formGroups() {
        let groups = []
        for (let i = 0; i < this.waitingList.length; i+= MAX_PLAYER_PER_GAME) {
            // groups.push(this.waitingList.splice(i, i + MAX_PLAYER_PER_GAME).map((item) => {return item.remoteAddress}));
            groups.push(this.waitingList.splice(i, i + MAX_PLAYER_PER_GAME).map(() => {return `39.127.58.187`}));
        }
        return groups;
    };

    splitList(arr) {
        const result = [];

        for (let i = 0; i < arr.length; i += MAX_PER_SUBQUEUE) {
            result.push(arr.slice(i, i + MAX_PER_SUBQUEUE));
        }

        return result;
    }

     async createSessions(list) {
        return new Promise( (resolve) => {
            for (const item of list) {
                 axios.post(
                    "https://api.edgegap.com/v1/session",
                    {
                        "app_name": "NetworkTest",
                        "version_name": "v1.0.0",
                        "ip_list": item,
                        // webookUrl
                    },
                    {
                        "authorization": process.env.EDGEGAP_TOKEN
                    },
                ).then((response) => {
                    if (response.status !== 200) {
                        logger.warn(`Failed to create session (code ${response.status}) => ${response.data?.message}`);
                    }
                }).catch((err) => {
                    logger.warn(`Failed to create session (code ${err.response.status}) => ${err.response.data?.message}`);
                });
            }

            resolve(list);
        })
    }
}

module.exports = new Matchmaker();