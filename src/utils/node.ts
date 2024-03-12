import {execSync} from "child_process";
import {BigNumber} from "@ethersproject/bignumber";

/**
 * Executes commands against an CCTL node running in docker.
 */
export class Node {

    public constructor(private dockerName: string) {}

    public getStateRootHash(nodeId: number): string {
        const console = this.exec('cctl-chain-view-state-root-hash', 'node=' + nodeId);
        const nodes = console.split('\n');
        return nodes[nodeId -1].split("=")[1].trim();
    }

    public getNodeStatus(nodeId: number): any {
        const console = this.exec('cctl-infra-node-view-status', 'node=' + nodeId);
        const json = console.substring(console.indexOf('{'));
        return JSON.parse(json);
    }

    public getAccountMainPurse(userId: number): any {
        const console = this.exec('cctl-chain-view-account-of-user', 'user=' + userId);
        const json = console.substring(console.indexOf('{'));
        return JSON.parse(json);
    }

    public geAccountBalance(purseUref: string): BigNumber {
        const console = this.exec("view_chain_balance.sh", 'purse-uref=' + purseUref);
        return BigNumber.from(console.split("=")[1].trim());
    }

    public getChainBlock(blockHash: string): any {
        const json = this.exec("cctl-chain-view-block", "block=" + blockHash);
        return JSON.parse(json);
    }

    public getChainEraInfo(): any {
        const json = this.exec('view_chain_era_info.sh', '');
        return JSON.parse(json);
    }

    public getChainBlockTransfers(blockHash: string): any {
        const json = this.exec('view_chain_block_transfers.sh', 'block=' + blockHash);
        return JSON.parse(json);
    }

    private exec(method: string, params: string): string {

        // Invokes the node command and pipes through sed to remove all ANSI codes and return plain text
        const command = `docker exec -t ${this.dockerName} /bin/bash -c -i "${method} ${params} | sed -e 's/\x1b\\[.\\{1,5\\}m//g'"`;
        const stdOut = execSync(command);
        return stdOut.toString();
    }
}
