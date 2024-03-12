import {ContextMap} from "../utils/context-map";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {Node} from "../utils/node";
import {binding, given, then} from "cucumber-tsflow";
import {expect} from "chai";
import {SimpleRpcClient} from "../utils/simple-rpc-client";
import {BigNumber} from "@ethersproject/bignumber";

/**
 * The state_get_balance feature's steps
 */
@binding()
export class StateGetBalanceSteps {
    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private node = new Node(TestParameters.getInstance().dockerName);
    private simpleRpc = new SimpleRpcClient(TestParameters.getInstance().getHostname(), TestParameters.getInstance().getRcpPort());

    @given(/^that the state_get_balance RPC method is invoked against nclt user-1 purse$/)
    public async thatTheState_get_balanceRPCMethodIsInvoked() {
        console.info("Given that the state_get_balance RPC method is invoked");
        const stateRootHash = this.node.getStateRootHash(1);
        const accountMainPurse = this.node.getAccountMainPurse(1);
        const purseUref: string = accountMainPurse.main_purse;
        await this.casperClient.nodeClient.getAccountBalance(stateRootHash, purseUref).then(balance => {
            this.contextMap.put("stateGetBalanceResult", balance);
        });
    }

    @then("a valid state_get_balance_result is returned")
    public aValidState_get_balance_resultIsReturned() {
        console.info("Then a valid state_get_balance_result is returned");

        let stateGetBalanceResult = this.contextMap.get('stateGetBalanceResult');
        expect(stateGetBalanceResult).to.not.be.undefined;
    }

    @then(/^the state_get_balance_result contains the purse amount$/)
    public async theState_get_balance_resultContainsThePurseAmount() {
        console.info("And the state_get_balance_result contains the purse amount");

        const accountMainPurse = this.node.getAccountMainPurse(1);
        const balance = await this.simpleRpc.queryGetBalance('purse_uref', accountMainPurse.main_purse);
        const balanceData: BigNumber = this.contextMap.get("stateGetBalanceResult");
        expect(balanceData instanceof BigNumber).to.be.true;
        expect(balanceData.toString()).to.be.eql(balance.result.balance);
    }

    @then(/^the state_get_balance_result contains api version "([^"]*)"$/)
    public theState_get_balance_resultContainsIsForApiVersion(apiVersion: string) {
        console.info("And the state_get_balance_result contains api version {}", apiVersion);
        // NOT IMPLEMENTED IN TYPESCRIPT SDK
    }

    @then(/^the state_get_balance_result contains a valid merkle proof$/)
    public theState_get_balance_resultContainsAValidMerkleProof() {
        console.info("And the state_get_balance_result contains a valid merkle proof");
        // NOT IMPLEMENTED IN TYPESCRIPT SDK
    }
}
