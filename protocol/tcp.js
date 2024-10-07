const IP = require('../utils/ip').IP;
const net = require("net")
const {Buffer} = require("node:buffer");
const { decodeToken } = require('../utils/token');
const waitingList = Array()

const playerConns = {}
const deploymentsConns = {}

let deployments = [
    "127.0.0.1"
]

let isValidToken = (obj) => {
    const isInDb = obj.email === "quentin.briand@epitech.eu" || obj.email === "leo.viltard@epitech.eu";
    const hasValidTimestamp = obj.timestamp !== undefined && new Date() - new Date(obj.timestamp) > 5000;
    
    return isInDb && hasValidTimestamp;
}

let isValidDeploymentIp = (ip) => {
    return deployments.includes(ip);
}	

exports.tcpServer = net.createServer(
    (socket) => {
        if (isValidDeploymentIp(socket.remoteAddress)) {
            console.log(`Deployment ${socket.remoteAddress} connected`);
            deploymentsConns[socket.remoteAddress] = socket;
        } else {
            playerConns[socket.remoteAddress] = {
                "socket": socket,
                "isAuth": false,
                "conn_date": new Date()
            }
        }
        

        socket.on("data", (data) => {
            if (isValidDeploymentIp(socket.remoteAddress)) {
                // write what to do when deployment connect
            } else {
                const stringData = data.toString();
                if (stringData.startsWith("auth")) {
                    const token = stringData.slice(4);
                    const obj = decodeToken(token);
                    if (isValidToken(obj) === false) {
                        console.log(`Client ${socket.remoteAddress} failed authentication`);
                        removeUser(socket.remoteAddress);
                        return;
                    }
                    playerConns[socket.remoteAddress].isAuth = true;
                    console.log(`Client ${socket.remoteAddress} authenticated`);
                    waitingList.push(socket);
                }
            }
        });

        socket.on("end", () => {
            if (isValidDeploymentIp(socket.remoteAddress)) {
                // write what to do when deployment disconnect
            } else {
                console.log(`Client ${socket.remoteAddress} disconnected`);
                const index = waitingList.indexOf(socket)
                if (index !== -1)
                    waitingList.splice(index, 1)
                removeUser(socket.remoteAddress);
            }
        });
    }
)
let send_ipv4 = IP.split('.').reduce(function(int, value) { return (int) * 256 + +value });

const buffer = Buffer.alloc(12);
buffer.writeBigInt64LE(BigInt(send_ipv4));
buffer.writeInt32LE(4242, 8);

setInterval(() => {
    if (waitingList.length === 0)
        return
    const user = waitingList.pop()

    user.write(buffer)
    console.log("Client found game")
}, 5000);

setInterval(() => {
    for (const [key, value] of Object.entries(playerConns)) {
        if (value.isAuth === false && new Date() - value.conn_date > 5000) {
            removeUser(key);
        }
    }
}, 1000);

let removeUser = (ip) => {
    playerConns[ip].socket.end();
    delete playerConns[ip];
    
    console.log(`Client ${ip} removed`);
}

