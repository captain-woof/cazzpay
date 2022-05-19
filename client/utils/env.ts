import { DeployEnv } from "../types/deployEnv"

interface ValuesBasedOnDeployEnv {
    local?: any;
    development?: any;
    production?: any;
}

/**
 * @summary Sets a value based on whether the deployment environment is "local", "development", or "production"
 * @param valuesBasedOnDeployEnv A mapping of deployment environments as keys and corresponding values
 * @returns Value based on the deployment env, as specified by `valuesBasedOnDeployEnv` mapping
 */
export const getValueBasedOnEnv = (valuesBasedOnDeployEnv: ValuesBasedOnDeployEnv) => {
    const deployEnvironment: DeployEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV as DeployEnv;
    return valuesBasedOnDeployEnv[deployEnvironment];
}