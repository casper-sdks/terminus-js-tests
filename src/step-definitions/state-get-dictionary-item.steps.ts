import {binding, given, then} from "cucumber-tsflow";
import {expect} from "chai";
import {ContextMap} from "../utils/context-map";
import {CasperClient, Keys} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";

/**
 * The state_get_dictionary_item feautre's steps
 */
@binding()
export class StateGetDictionaryItemSteps {

    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that the state_get_dictionary_item RCP method is invoked$/)
    public async thatTheState_get_dictionary_itemRCPMethodIsInvoked() {
        console.info("Given that the state_get_dictionary_item RCP method is invoked");
        let stateRootHash = '';
        await this.casperClient.nodeClient.getStateRootHash().then(result => {
            stateRootHash = result
        });

        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/faucet/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const accountHash: string = 'account-hash-' + faucetKey.publicKey.toAccountRawHashStr();

        await this.casperClient.getAccountMainPurseUref(faucetKey.publicKey).then(mainPurse => {
            this.contextMap.put('mainPurse', mainPurse);
        });

        this.contextMap.put('accountHash', accountHash);

        await this.casperClient.nodeClient.getBlockState(
            stateRootHash,
            accountHash,
            []
        ).then(dictionaryData => {
            this.contextMap.put("stateGetDictionaryItem", dictionaryData);
        });
    }

    @then(/^a valid state_get_dictionary_item_result is returned$/)
    public aValidState_get_dictionary_item_resultIsReturned() {
        console.info("Then a valid state_get_dictionary_item_result is returned");
        const dictionaryData: any = this.contextMap.get("stateGetDictionaryItem");
        expect(dictionaryData).to.be.not.undefined;
        let accountHash = this.contextMap.get('accountHash');
        expect(dictionaryData.Account._accountHash).to.be.eql(accountHash);
        expect(dictionaryData.Account.associatedKeys[0].accountHash).to.be.eql(accountHash);
        let mainPurse = this.contextMap.get('mainPurse');
        expect(dictionaryData.Account.mainPurse).to.be.eql(mainPurse);
    }
}
