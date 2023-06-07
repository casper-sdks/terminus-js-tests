import {ContextMap} from "../utils/context-map";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {NctlClient} from "../utils/nctl-client";
import {binding, given, then} from "cucumber-tsflow";
import {expect} from "chai";

/**
 * The state_get_balance feature's steps
 */
@binding()
export class StateGetBalanceSteps {
    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private nctl = new NctlClient(TestParameters.getInstance().dockerName);

    @given(/^that the state_get_balance RPC method is invoked against nclt user-1 purse$/)
    public async thatTheState_get_balanceRPCMethodIsInvoked() {
        console.info("Given that the state_get_balance RPC method is invoked");
        const stateRootHash = this.nctl.getStateRootHash(1);
        const accountMainPurse = this.nctl.getAccountMainPurse(1);
        const purseUref: string = accountMainPurse.stored_value.Account.main_purse;
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
    public theState_get_balance_resultContainsThePurseAmount() {
        console.info("And the state_get_balance_result contains the purse amount");

        const accountMainPurse = this.nctl.getAccountMainPurse(1);
        const balance = this.nctl.geAccountBalance(accountMainPurse.stored_value.Account.main_purse);
        const balanceData = this.contextMap.get("stateGetBalanceResult");
        expect(balanceData).to.be.eql(balance);
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
