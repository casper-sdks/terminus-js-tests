import {binding, given, then} from "cucumber-tsflow";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {expect} from "chai";
import {fail} from "assert";

/**
 * The state_get_account_info feature steps.
 */
@binding()
export class StateGetAccountInfoSteps {

    /** The client under test */
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that the state_get_account_info RCP method is invoked against nctl$/)
    public async thatTheStateGetAccountInfoRcpMethodIsInvoked() {

        console.info("Given that the state_get_account_info RCP method is invoked against nctl");

        const hexPublicKey = this.getUserOneHexPublicKey();

        let blockHash: string | null = null;
        await this.casperClient.nodeClient.getLatestBlockInfo().then(result => {
            blockHash = result.block?.hash as string;
        });

        expect(blockHash).to.not.be.null;

        fail("state_get_account_info not implemented in TS Client")
        /*  final JsonBlockData block = CasperClientProvider.getInstance().getCasperService().getBlock();
          final BlockIdentifier identifier = new HashBlockIdentifier(block.getBlock().getHash().toString());

          final AccountData stateAccountInfo = CasperClientProvider.getInstance().getCasperService().getStateAccountInfo(hexPublicKey, identifier);
          contextMap.put(STATE_ACCOUNT_INFO, stateAccountInfo);*/
    }

    @then(/^a valid state_get_account_info_result is returned$/)
    public aValidState_get_account_info_resultIsReturned() {
        console.info("Then a valid state_get_account_info_result is returned");
        /*  final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
          assertThat(stateAccountInfo, is(notNullValue()));*/
    }

    @then(/^the state_get_account_info_result contain a valid account hash$/)
    public theState_get_account_info_resultContainAValidAccountHash() {
        console.info("And the state_get_account_info_result contain a valid account hash");
        /*   final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
           final String expectedAccountHash = nctl.getAccountHash(1);
           assertThat(stateAccountInfo.getAccount().getHash(), is(expectedAccountHash));*/
    }

    @then(/^the state_get_account_info_result contain a valid main purse uref$/)
    public theState_get_account_info_resultContainAValidMainPurseUref() {
        console.info("And the state_get_account_info_result contain a valid main purse uref");
        /* final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
         final String accountMainPurse = nctl.getAccountMainPurse(1);
         assertThat(stateAccountInfo.getAccount().getMainPurse(), is(accountMainPurse));*/
    }

    @then(/^the state_get_account_info_result contain a valid merkle proof$/)
    public theState_get_account_info_resultContainAValidMerkleProof() {
        console.info("And the state_get_account_info_result contain a valid merkle proof");
        /* final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
         assertThat(stateAccountInfo.getMerkelProof(), is(notNullValue()));
         assertThat(stateAccountInfo.getMerkelProof(), is(isValidMerkleProof(nctl.getAccountMerkelProof(1))));*/
    }

    @then(/^the state_get_account_info_result contain a valid associated keys$/)
    public theState_get_account_info_resultContainAValidAssociatedKeys() {
        console.info("And the state_get_account_info_result contain a valid associated keys");
        /*    final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
            final String expectedAccountHash = nctl.getAccountHash(1);
            assertThat(stateAccountInfo.getAccount().getAssociatedKeys().get(0).getAccountHash(), is(expectedAccountHash));
            assertThat(stateAccountInfo.getAccount().getAssociatedKeys().get(0).getWeight(), is(1));*/
    }


    @then(/^the state_get_account_info_result contain a valid action thresholds$/)
    public theState_get_account_info_resultContainAValidActionThresholds() {
        console.info("And the state_get_account_info_result contain a valid action thresholds");
        /*   final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
           final JsonNode userAccountJson = nctl.getUserAccount(1);
           final ActionThresholds deployment = stateAccountInfo.getAccount().getDeployment();
           assertThat(deployment, is(notNullValue()));
           assertThat(deployment.getDeployment(), is(userAccountJson.at("/stored_value/Account/action_thresholds/deployment").asInt()));
           assertThat(deployment.getKeyManagement(), is(userAccountJson.at("/stored_value/Account/action_thresholds/key_management").asInt()));*/
    }

    @then(/^the state_get_account_info_result contain a valid named keys$/)
    public theState_get_account_info_resultContainAValidNamedKeys() {
        console.info("And the state_get_account_info_result contain a valid action thresholds");
        /*  final AccountData stateAccountInfo = contextMap.get(STATE_ACCOUNT_INFO);
          final JsonNode userAccountJson = nctl.getUserAccount(1);
          assertThat(stateAccountInfo.getAccount().getNamedKeys().size(), is(userAccountJson.at("/stored_value/Account/named_keys").size()));*/
    }

    private getUserOneHexPublicKey(): string {
        /* final URL keyUrl = AssetUtils.getUserKeyAsset(1, 1, "secret_key.pem");
         final Ed25519PrivateKey privateKey = new Ed25519PrivateKey();
         privateKey.readPrivateKey(keyUrl.getFile());
         final AbstractPublicKey publicKey = privateKey.derivePublicKey();
         return PublicKey.fromAbstractPublicKey(publicKey).getAlgoTaggedHex();*/
        return '';
    }
}