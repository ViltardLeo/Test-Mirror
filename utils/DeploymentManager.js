class DeploymentManager {

    constructor() {
        this.deployments = [];
    }

    isDeployment(socket) {
        return socket in this.deployments;
    }
}

module.exports = new DeploymentManager();