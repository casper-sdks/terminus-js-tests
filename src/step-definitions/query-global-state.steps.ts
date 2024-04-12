import {CasperClient, DeployUtil, Keys, StoredValue} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {expect} from "chai";
import {binding, given, then, when} from "cucumber-tsflow";
import {BigNumber} from "@ethersproject/bignumber";
import {EventUtils} from "../utils/event-utils";
import {fail} from "assert";

/**
 * query_global_state feature step definitions.
 */
@binding()
export class QueryGlobalStateSteps {

    /** The client under test */
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    /** The map used to share results and variables across step definitions. */
    private contextMap = ContextMap.getInstance();


    @given(/^that a valid block hash is known$/, undefined, 300000)
    public async thatAValidBlockHashIsKnown() {

        console.info("Given that a valid block hash is known");

        // Create a transfer
        await this.createTransfer();

        // Wait for a block to be added for the transfer
        await this.waitForBlockAdded();

        expect(this.contextMap.get("lastBlockAdded")).to.not.be.null;
    }


    @when(/^the query_global_state RCP method is invoked with the block hash as the query identifier$/)
    public async theQuery_global_stateRCPMethodIsInvokedWithTheBlockHashAsTheQueryIdentifier() {

        console.info("And the query_global_state RCP method is invoked with the block hash as the query identifier");

        const blockHash: string = (this.contextMap.get("lastBlockAdded") as any).block.hash;
        const deployHash: string = this.contextMap.get("deployResult");
        const key = "deploy-" + deployHash;

        // FIXME this is not implemented in TS SDK
       /* await this.casperClient.nodeClient.queryGlobalState(blockHash, key, []).then(storedValue => {
            this.contextMap.put("globalStateData", storedValue);
        }); */
        fail("query_global_state not implemented in TypeScript SDK");

        expect(this.contextMap.get("globalStateData")).to.not.be.null;
    }

    @then("a valid query_global_state_result is returned")
    public aValidQuery_global_state_resultIsReturned() {

        console.info("Then a valid query_global_state_result is returned");

        const globalStateData = this.contextMap.get("globalStateData");
        expect(globalStateData).to.not.be.null;
        /*assertThat(globalStateData, is(notNullValue()));
        assertThat(globalStateData.getApiVersion(), is("1.0.0"));
        assertThat(globalStateData.getMerkleProof(), is(notNullValue()));
        assertThat(globalStateData.getHeader().getTimeStamp(), is(notNullValue()));
        assertThat(globalStateData.getHeader().getEraId(), is(greaterThan(0L)));
        assertThat(globalStateData.getHeader().getAccumulatedSeed().isValid(), is(true));
        assertThat(globalStateData.getHeader().getBodyHash().isValid(), is(true));
        assertThat(globalStateData.getHeader().getParentHash().isValid(), is(true));*/
    }

    @then("the query_global_state_result contains a valid deploy info stored value")
    public theQuery_global_state_resultContainsAValidStoredValue() {
        console.info("And the query_global_state_result contains a valid deploy info stored value");
        const globalStateData = this.contextMap.get("globalStateData");
        expect(globalStateData).to.not.be.null;
        //  assertThat(globalStateData.getStoredValue(), is(instanceOf(StoredValueDeployInfo.class)));
    }

    @then(/^the query_global_state_result's stored value from is the user-(\d+) account hash$/)
    public theQuery_global_state_resultSStoredValueSFromIsTheUserAccountHash(userId: number) {

        console.info(`And the query_global_state_result's stored value from is the user-${userId} account hash`);
        const storedValue : StoredValue = this.contextMap.get("globalStateData");
        const accountHash = ""; // TODO node.getAccountHash(userId);
        expect(storedValue.DeployInfo?.from).to.be(accountHash);
        // DeployInfo storedValueDeployInfo = getGlobalDataDataStoredValue();
        // assertThat(storedValueDeployInfo.getFrom(), is(accountHash));*/
    }


    @then(/^the query_global_state_result's stored value contains a gas price of (\d+)$/)
    public theQuery_global_state_resultSStoredValueContainsAGasPriceOf(gasPrice: number) {
        console.info("And the query_global_state_result's stored value contains a gas price of {long}");
        /* DeployInfo storedValueDeployInfo = getGlobalDataDataStoredValue();
         assertThat(storedValueDeployInfo.getGas(), is(BigInteger.valueOf(gasPrice)));*/
    }

    @then("the query_global_state_result stored value contains the transfer hash")
    public theQuery_global_state_resultSStoredValueContainsTheTransferHash() {
        console.info("And the query_global_state_result stored value contains the transfer hash");
        /*  DeployInfo storedValueDeployInfo = getGlobalDataDataStoredValue();
          assertThat(storedValueDeployInfo.getTransfers().get(0), startsWith("transfer-"));*/
    }

    @then("the query_global_state_result stored value contains the transfer source uref")
    public theQuery_global_state_resultSStoredValueContainsTheTransferSource() {
        console.info("And the query_global_state_result stored value contains the transfer source uref");
        /* DeployInfo storedValueDeployInfo = getGlobalDataDataStoredValue();
         String accountMainPurse = node.getAccountMainPurse(1);
         assertThat(storedValueDeployInfo.getSource().getJsonURef(), is(accountMainPurse));*/
    }


    @given("that the state root hash is known")
    public thatTheStateRootHashIsKnown() {

        console.info("Given that the state root hash is known");
        /*    StateRootHashData stateRootHash = casperService.getStateRootHash();
            assertThat(stateRootHash, is(notNullValue()));
            assertThat(stateRootHash.getStateRootHash(), notNullValue());
            contextMap.put(STATE_ROOT_HASH, stateRootHash);*/
    }

    @when("the query_global_state RCP method is invoked with the state root hash as the query identifier and an invalid key")
    public theQuery_global_stateRCPMethodIsInvokedWithTheStateRootHashAsTheQueryIdentifier() {

        console.info("When the query_global_state RCP method is invoked with the state root hash as the query identifier");
        /* StateRootHashData stateRootHash = contextMap.get(STATE_ROOT_HASH);
         StateRootHashIdentifier globalStateIdentifier = new StateRootHashIdentifier(stateRootHash.getStateRootHash());
         // Need to invoke mode view-faucet-account to get uref
         String key = "uref-d0343bb766946f9f850a67765aae267044fa79a6cd50235ffff248a37534";
         try {
             casperService.queryGlobalState(globalStateIdentifier, key, new String[0]);
         } catch (Exception e) {
             if (e instanceof CasperClientException) {
                 contextMap.put(CLIENT_EXCEPTION, e);
                 return;
             } else {
                 throw new RuntimeException(e);
             }
         }
         fail("Should have thrown a CasperClientException");*/
    }

    @then(/^an error code of -(\d+) is returned$/)
    public anAnErrorCodeOfIsReturned(errorCode: number) {

        /*  CasperClientException clientException = contextMap.get(CLIENT_EXCEPTION);
          assertThat(clientException.toString(), containsString("code: " + errorCode));

         */
    }

    @then(/^an error message of "([^"]*)" is returned$/)
    public anErrorMessageOfIsReturned(errorMessage: string) {
        /*  CasperClientException clientException = contextMap.get(CLIENT_EXCEPTION);
          assertThat(clientException.toString(), containsString(errorMessage));*/
    }

    @given("the query_global_state RCP method is invoked with an invalid block hash as the query identifier")
    public theQuery_global_stateRCPMethodIsInvokedWithAnInvalidBlockHashAsTheQueryIdentifier() {

        /* BlockHashIdentifier globalStateIdentifier = new BlockHashIdentifier("00112233441343670f71afb96018ab193855a85adc412f81571570dea34f2ca6500");
         String key = "deploy-80fbb9c25eebda88e5d2eb9a0f7053ad6098d487aff841dc719e1526e0f59728";
         try {
             casperService.queryGlobalState(globalStateIdentifier, key, new String[0]);
         } catch (Exception e) {
             if (e instanceof CasperClientException) {
                 contextMap.put(CLIENT_EXCEPTION, e);
                 return;
             } else {
                 throw new RuntimeException(e);
             }
         }
         fail("Should have thrown a CasperClientException");*/
    }

    async createTransfer() {

        console.info("createTransfer");

        const amount = BigNumber.from(2500000000);
        const senderKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-1/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const receiverKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-2/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);

        expect(senderKeyPair).to.not.be.undefined;
        expect(receiverKeyPair).to.not.be.undefined;
        const id = BigNumber.from(Math.round(Math.random()));
        const gasPrice: number = 100000000;
        const ttl = DeployUtil.dehumanizerTTL("30m");

        const transfer = DeployUtil.ExecutableDeployItem.newTransfer(amount, receiverKeyPair.publicKey, undefined, id);
        expect(transfer).to.not.be.undefined;

        const standardPayment = DeployUtil.standardPayment(BigNumber.from(100000000));
        expect(standardPayment).to.not.be.undefined;

        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, TestParameters.getInstance().chainName, gasPrice, ttl);
        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        this.casperClient.signDeploy(deploy, senderKeyPair);

        await this.casperClient.putDeploy(deploy).then(deployResult => {
            this.contextMap.put("deployResult", deployResult);
        }).catch(reason => {
            fail(reason);
        });

        expect(this.contextMap.get("deployResult")).to.not.be.null;
    }

    async waitForBlockAdded() {

        console.info("waitForBlockAdded");

        const deployHash: string = this.contextMap.get("deployResult");
        let blockAddedEvent: any | null = null;

        await EventUtils.waitForABlockAddedEventWithATimoutOfSeconds(this.casperClient, deployHash, 300).then(event => {
            blockAddedEvent = event;
        });

        expect(blockAddedEvent).to.not.be.null;

        let actualBlockResult: any | null = null;

        await this.casperClient.nodeClient.getBlockInfo(blockAddedEvent.body.BlockAdded.block_hash).then(getBlockResult => {
            actualBlockResult = getBlockResult;
        });

        expect(actualBlockResult).to.not.be.null;

        this.contextMap.put("lastBlockAdded", actualBlockResult);
    }

    private getGlobalDataDataStoredValue<T>(): T {
        /*  GlobalStateData globalStateData = contextMap.get(GLOBAL_STATE_DATA);
          //noinspection unchecked
          return (T) globalStateData.getStoredValue().getValue();*/
        return null as T;
    }
}
