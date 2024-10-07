const crypto = require('crypto');
// const {exitOnError, error} = require("winston");
const logger = require('../logging').logger.child({ serviceName: 'TokenGeneration' });

if (!process.env.LOGIN_SECRET) {
    logger.error( "Missing environment key: LOGIN_SECRET");
    process.exit(84);
}

exports.encodeToken = function (payload) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(process.env.LOGIN_SECRET, 'salt', 32);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const stringData = JSON.stringify(payload);

    let encrypted = cipher.update(stringData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

exports.decodeToken = function (token) {
    if (!process.env.LOGIN_SECRET) {
        // exitOnError(new Error("Missing environment key: LOGIN_SECRET"));
    }
    const [ivHex, encrypted] = token.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(process.env.LOGIN_SECRET, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}

exports.isValidToken = (obj) => {
    const isInDb = obj.email === "quentin.briand@epitech.eu" || obj.email === "leo.viltard@epitech.eu";
    const hasValidTimestamp = obj.timestamp !== undefined && new Date() - new Date(obj.timestamp) < 50000000;

    return isInDb && hasValidTimestamp;
}