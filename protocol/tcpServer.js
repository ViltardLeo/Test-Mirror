const net = require("net")
const deploymentManager = require("../utils/DeploymentManager")
const playerManager = require("../utils/PlayerManager")
const matchmaker = require("./Matchmaker")
const {decodeToken, isValidToken} = require("../utils/token");
const logger = require('../logging').logger.child({ serviceName: 'TcpServer' });


function onSocketJoin(socket) {
    if (deploymentManager.isDeployment(socket)) {
        // write what to do when deployment connect
    } else {
        playerManager.addPlayer(socket);
    }
}

function onDataReceive(socket, data) {
    if (deploymentManager.isDeployment(socket)) {
        // write what to do when deployment connect
    } else {
        const stringData = data.toString();
        if (!stringData.startsWith("auth")) {
            logger.warn(`Client ${socket.remoteAddress} failed authentication (bad header)`);
            playerManager.removePlayer(socket.remoteAddress);
            return;
        }

        const token = stringData.slice(4);
        const obj = decodeToken(token);
        if (isValidToken(obj) === false) {
            logger.warn(`Client ${socket.remoteAddress}:${socket.remotePort} failed authentication (invalid token)`);
            playerManager.removePlayer(socket);
            return;
        }

        playerManager.setAuthPlayer(socket);
        matchmaker.addToWaitingList(socket);
    }
}

function onSocketEnd(socket) {
    playerManager.removePlayer(socket);
    if (playerManager.isAuth(socket)) {
        matchmaker.removeFromWaitingList(socket);
    }
    logger.info(`Client ${socket.remoteAddress}:${socket.remotePort} disconnected`);
}

function socketHandler(socket) {
    onSocketJoin(socket);
    socket.on("data", (data) => onDataReceive(socket, data));
    socket.on("end", () => onSocketEnd(socket));
    socket.on("error", () => onSocketEnd(socket));
}

exports.tcpServer = net.createServer(socketHandler)