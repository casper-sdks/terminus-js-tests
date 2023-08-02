import {ContextMap} from "../utils/context-map";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {NctlClient} from "../utils/nctl-client";
import {binding, given, then} from "cucumber-tsflow";
import {expect} from "chai";

/**
 * The steps for the chain_get_state_root_hash feature.
 */
@binding()
export class ChainGetStateRootHashSteps {

    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private nctl = new NctlClient(TestParameters.getInstance().dockerName);

    @given(/^that the chain_get_state_root_hash RCP method is invoked against nctl$/)
    public async thatTheChain_get_state_root_hashRCPMethodIsInvoked() {

        console.info("Given that the chain_get_state_root_hash RCP method is invoked");
        this.contextMap.put('stateRootHash', await this.casperClient.nodeClient.getStateRootHash());
    }

    @then(/^a valid chain_get_state_root_hash_result is returned$/)
    public aValidChain_get_state_root_hash_resultIsReturned() {

        console.info("Then a valid chain_get_state_root_hash_result is returned");
        const stateRootHashData = this.contextMap.get('stateRootHash');
        expect(stateRootHashData).to.not.be.undefined;

        const expectedStateRootHash =  this.nctl.getStateRootHash(1);
        expect(stateRootHashData).to.be.eql(expectedStateRootHash);
    }
}
