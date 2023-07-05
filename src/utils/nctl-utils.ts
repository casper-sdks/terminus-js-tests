import {execSync} from "child_process";
import {TestParameters} from "./test-parameters";

/**
 * Executes commands against an NCTL node running in docker.
 */
export class NctlUtils {

    public static getStateRootHash(nodeId: number): string {
        const console = NctlUtils.nctlExec('view_chain_state_root_hash.sh', 'node=' + nodeId);
        return console.split("=")[1].trim();
    }

    static getNodeStatus(nodeId: number): any {
        const console = NctlUtils.nctlExec('view_node_status.sh', 'node=' + nodeId);
        const json = console.substring(console.indexOf('{'));
        return JSON.parse(json);
    }

    private static nctlExec(method: string, params: string): string {
        const dockerName = TestParameters.getInstance().dockerName;
        // Invokes the nctl command and pipes through sed to remove all ANSI codes and return plain text
        const command = `docker exec -t ${dockerName} /bin/bash -c "source casper-node/utils/nctl/sh/views/${method} ${params} | sed -e 's/\x1b\\[.\\{1,5\\}m//g'"`;
        const stdOut = execSync(command);
        return stdOut.toString();
    }

    static getAccountHash(userId: number): string {
        // TODO
        return '' + userId;

    }
}