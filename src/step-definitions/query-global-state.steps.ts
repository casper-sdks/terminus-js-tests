/**
 * Cucumber step definitions for query_global_state RCP method calls.
 *
 * @author ian@meywood.com
 */
import {given, then, when} from "cucumber-tsflow";
import {ParameterMap} from "../utils/parameter-map";
import {CasperClient, StoredValue} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {expect} from "chai";
import {NctlUtils} from "../utils/nctl-utils";
import {GetDeployResult} from "casper-js-sdk/dist/services";

export class QueryGlobalStateStepDefinitions {


    private parameterMap = ParameterMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that a valid block hash is known$/)
    public thatAValidBlockHashIsKnown() {

        // Create a transfer
        this.createTransfer();

        // Wait for a block to be added for the transfer
        this.waitForBlockAdded();

        console.info("Given that a valid block hash is known");

        expect(this.parameterMap.get('lastBLockAdded')).to.not.be.null;
    }


    @when(/^the query_global_state RCP method is invoked with the block hash as the query identifier$/)
    public async theQuery_global_stateRCPMethodIsInvokedWithTheBlockHashAsTheQueryIdentifier() {

        console.info("And the query_global_state RCP method is invoked with the block hash as the query identifier");

        const blockHash: string = (this.parameterMap.get('lastBlockAdded') as any).block_hash;
        const globalStateIdentifier = blockHash;
        const deployResult : GetDeployResult = this.parameterMap.get('deployResult');
        const key = "deploy-" + deployResult.deploy.hash;

        await this.casperClient.nodeClient.getBlockState(globalStateIdentifier, key, []).then(storedValue => {
            this.parameterMap.put('storedValue', storedValue);
        });

        expect(this.parameterMap.get('storedValue')).to.be.not.null;
    }


    @then(/^a valid query_global_state_result is returned$/)
    public aValidQuery_global_state_resultIsReturned() {

        console.info("Then a valid query_global_state_result is returned");

        /*

         globalStateData = parameterMap.get(GLOBAL_STATE_DATA);
        assertThat(globalStateData, is(notNullValue()));
        assertThat(globalStateData.getApiVersion(), is("1.0.0"));
        assertThat(globalStateData.getMerkleProof(), is(notNullValue()));
        assertThat(globalStateData.getHeader().getTimeStamp(), is(notNullValue()));
        assertThat(globalStateData.getHeader().getEraId(), is(greaterThan(0L)));
        assertThat(globalStateData.getHeader().getAccumulatedSeed().isValid(), is(true));
        assertThat(globalStateData.getHeader().getBodyHash().isValid(), is(true));
        assertThat(globalStateData.getHeader().getParentHash().isValid(), is(true));

         */
    }

    @then(/^the query_global_state_result contains a valid deploy info stored value$/)
    public theQuery_global_state_resultContainsAValidStoredValue() {
        console.info("And the query_global_state_result contains a valid deploy info stored value");
        const storedValue: StoredValue = this.parameterMap.get('storedValue');
        expect(storedValue).to.be('StoredValue');
    }

    @then(/^the query_global_state_result's stored value from is the user-(\d+) account hash$/)
    public theQuery_global_state_resultSStoredValueSFromIsTheUserAccountHash(userId: number) {

        console.info("And the query_global_state_result's stored value from is the user-{int} account hash");
        const accountHash = NctlUtils.getAccountHash(userId);
        const storedValue: StoredValue = this.getGlobalDataDataStoredValue();
        expect(storedValue.Account?.accountHash()).to.be.not.null;
        // assertThat(storedValueDeployInfo.getFrom(), is(accountHash));
    }


    @then(/^the query_global_state_result's stored value contains a gas price of (\d+)$/)
    public theQuery_global_state_resultSStoredValueContainsAGasPriceOf(gasPrice: number) {
        console.info("And the query_global_state_result's stored value contains a gas price of {long}");
        const storedValue = this.getGlobalDataDataStoredValue();
        expect(storedValue.DeployInfo?.gas).to.eql(gasPrice);
    }

    @then(/^the query_global_state_result stored value contains the transfer hash$/)
    public theQuery_global_state_resultSStoredValueContainsTheTransferHash() {
        console.info("And the query_global_state_result stored value contains the transfer hash");
        const storedValue = this.getGlobalDataDataStoredValue();

        // TODO use getBlockTransfers
        /*
        DeployInfo storedValueDeployInfo = getGlobalDataDataStoredValue();
        assertThat(storedValueDeployInfo.getTransfers().get(0), startsWith("transfer-"));

         */
    }

    @then(/^the query_global_state_result stored value contains the transfer source uref$/)
    public theQuery_global_state_resultSStoredValueContainsTheTransferSource() {
        console.info("And the query_global_state_result stored value contains the transfer source uref");
        /*
        DeployInfo storedValueDeployInfo = getGlobalDataDataStoredValue();
        String accountMainPurse = NctlUtils.getAccountMainPurse(1);
        assertThat(storedValueDeployInfo.getSource().getJsonURef(), is(accountMainPurse));

         */
    }


    @given(/^that the state root hash is known$/)
    public thatTheStateRootHashIsKnown() {

        console.info("Given that the state root hash is known");
        /*
        StateRootHashData stateRootHash = casperService.getStateRootHash();
        assertThat(stateRootHash, is(notNullValue()));
        assertThat(stateRootHash.getStateRootHash(), notNullValue());
        parameterMap.put(STATE_ROOT_HASH, stateRootHash);
         */
    }

    @when(/^the query_global_state RCP method is invoked with the state root hash as the query identifier and an invalid key$/)
    public theQuery_global_stateRCPMethodIsInvokedWithTheStateRootHashAsTheQueryIdentifier() {

        console.info("When the query_global_state RCP method is invoked with the state root hash as the query identifier");
        /*
        StateRootHashData stateRootHash = parameterMap.get(STATE_ROOT_HASH);
        StateRootHashIdentifier globalStateIdentifier = new StateRootHashIdentifier(stateRootHash.getStateRootHash());
        // Need to invoke nctl-view-faucet-account to get uref
        String key = "uref-d0343bb766946f9f850a67765aae267044fa79a6cd50235ffff248a37534";
        try {
            casperService.queryGlobalState(globalStateIdentifier, key, new String[0]);
        } catch (Exception e) {
            if (e instanceof CasperClientException) {
                parameterMap.put(CLIENT_EXCEPTION, e);
                return;
            } else {
                throw new RuntimeException(e);
            }
        }
        assert.fail("Should have thrown a CasperClientException");
         */
    }

    @then(/^an error code of (-\d+) is returned$/)
    public anAnErrorCodeOfIsReturned(errorCode: number) {

        /*
    CasperClientException clientException = parameterMap.get(CLIENT_EXCEPTION);
    assertThat(clientException.toString(), containsString("code: " + errorCode));
    
         */
    }

    @then(/^an error message of "([^"]*)" is returned$/)
    public anErrorMessageOfIsReturned(errorMessage: string) {
        /*
            CasperClientException clientException = parameterMap.get(CLIENT_EXCEPTION);
            assertThat(clientException.toString(), containsString(errorMessage));

         */
    }

    @given(/^the query_global_state RCP method is invoked with an invalid block hash as the query identifier$/)
    public theQuery_global_stateRCPMethodIsInvokedWithAnInvalidBlockHashAsTheQueryIdentifier() {
        /*
            BlockHashIdentifier globalStateIdentifier = new BlockHashIdentifier("00112233441343670f71afb96018ab193855a85adc412f81571570dea34f2ca6500");
            String key = "deploy-80fbb9c25eebda88e5d2eb9a0f7053ad6098d487aff841dc719e1526e0f59728";
            try {
                casperService.queryGlobalState(globalStateIdentifier, key, new String[0]);
            } catch (Exception e) {
                if (e instanceof CasperClientException) {
                    parameterMap.put(CLIENT_EXCEPTION, e);
                    return;
                } else {
                    throw new RuntimeException(e);
                }
            }
            fail("Should have thrown a CasperClientException");

         */
    }

    private createTransfer() {

        console.info("createTransfer");
        /*
            Date timestamp = new Date();
            Ed25519PrivateKey senderKey = new Ed25519PrivateKey();
            Ed25519PublicKey receiverKey = new Ed25519PublicKey();

            senderKey.readPrivateKey(AssetUtils.getUserKeyAsset(1, 1, SECRET_KEY_PEM).getFile());
            receiverKey.readPublicKey(AssetUtils.getUserKeyAsset(1, 2, PUBLIC_KEY_PEM).getFile());

            Deploy deploy = CasperTransferHelper.buildTransferDeploy(
                senderKey,
                PublicKey.fromAbstractPublicKey(receiverKey),
                BigInteger.valueOf(2500000000L),
            "casper-net-1",
                Math.abs(new Random().nextLong()),
                BigInteger.valueOf(100000000L),
            1L,
                Ttl.builder().ttl("30m").build(),
                timestamp,
                new ArrayList<>());

            parameterMap.put(PUT_DEPLOY, deploy);

            CasperService casperService = CasperClientProvider.getInstance().getCasperService();

            parameterMap.put(DEPLOY_RESULT, casperService.putDeploy(deploy));

         */
    }

    private waitForBlockAdded() {

        console.info("waitForBlockAdded");
        /*
            DeployResult deployResult = parameterMap.get(DEPLOY_RESULT);

            ExpiringMatcher<Event<BlockAdded>> matcher = (ExpiringMatcher<Event<BlockAdded>>) eventHandler.addEventMatcher(
                EventType.MAIN,
                hasTransferHashWithin(
                    deployResult.getDeployHash(),
                    blockAddedEvent -> parameterMap.put(LAST_BLOCK_ADDED, blockAddedEvent.getData())
                )
            );

            assertThat(matcher.waitForMatch(300), is(true));

            eventHandler.removeEventMatcher(EventType.MAIN, matcher);

            Digest matchingBlockHash = ((BlockAdded) parameterMap.get(LAST_BLOCK_ADDED)).getBlockHash();
            assertThat(matchingBlockHash, is(notNullValue()));

            JsonBlockData block = CasperClientProvider.getInstance().getCasperService().getBlock(new HashBlockIdentifier(matchingBlockHash.toString()));
            assertThat(block, is(notNullValue()));
            List<String> transferHashes = block.getBlock().getBody().getTransferHashes();
            assertThat(transferHashes, hasItem(deployResult.getDeployHash()));

         */
    }

    private getGlobalDataDataStoredValue(): StoredValue {
        return this.parameterMap.get('storedValue');
    }
}
