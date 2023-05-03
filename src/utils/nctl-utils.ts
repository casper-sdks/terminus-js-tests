import {execSync} from "child_process";

/**
 * Executes commands against an NCTL node running in docker.
 */
export class NctlUtils {

    public static getStateRootHash(nodeId: number): string {
        const console = NctlUtils.nctlExec('view_chain_state_root_hash.sh', 'node=' + nodeId);
        return console.split("=")[1].trim();
    }

    private static nctlExec(method: string, params: string): string {
        const command = `docker exec -t storm-nctl /bin/bash -c "source casper-node/utils/nctl/sh/views/${method} ${params}"`;
        const stdOut = execSync(command);
        return stdOut.toString();
    }
}