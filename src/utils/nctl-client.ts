import {execSync} from "child_process";
import {BigNumber} from "@ethersproject/bignumber";

/**
 * Executes commands against an NCTL node running in docker.
 */
export class NctlClient {

    public constructor(private dockerName: string) {
    }

    public getStateRootHash(nodeId: number): string {
        const console = this.exec('view_chain_state_root_hash.sh', 'node=' + nodeId);
        return console.split("=")[1].trim();
    }

    public getNodeStatus(nodeId: number): any {
        const console = this.exec('view_node_status.sh', 'node=' + nodeId);
        const json = console.substring(console.indexOf('{'));
        return JSON.parse(json);
    }

    public getAccountMainPurse(userId: number): any {
        const console = this.exec('view_user_account.sh', 'user=' + userId);
        const json = console.substring(console.indexOf('{'));
        return JSON.parse(json);
    }

    public geAccountBalance(purseUref: string): BigNumber {
        const console = this.exec("view_chain_balance.sh", 'purse-uref=' + purseUref);
        return BigNumber.from(console.split("=")[1].trim());
    }

    private exec(method: string, params: string): string {

        // Invokes the nctl command and pipes through sed to remove all ANSI codes and return plain text
        const command = `docker exec -t ${this.dockerName} /bin/bash -c "source casper-node/utils/nctl/sh/views/${method} ${params} | sed -e 's/\x1b\\[.\\{1,5\\}m//g'"`;
        const stdOut = execSync(command);
        return stdOut.toString();
    }


}