import {ContextMap} from "../utils/context-map";
import {NctlClient} from "../utils/nctl-client";
import {TestParameters} from "../utils/test-parameters";
import {CasperClient, DeployUtil, encodeBase16, Keys} from "casper-js-sdk";
import {expect} from "chai";
import {binding, given, then, when} from "cucumber-tsflow";
import {BigNumber} from "@ethersproject/bignumber";
import {EventUtils} from "../utils/event-utils";
import {fail} from "assert";

/**
 * The steps for the blocks feature
 */
@binding()
export class BlocksSteps {

    private invalidBlockHash = "2fe9630b7790852e4409d815b04ca98f37effcdf9097d317b9b9b8ad658f47c8";
    private invalidHeight = 9999999999;
    private blockErrorMsg = "block not known";
    private blockErrorCode = "-32001";
    private contextMap = ContextMap.getInstance();

    private nctl = new NctlClient(TestParameters.getInstance().dockerName);
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that the latest block is requested via the sdk$/)
    public async thatTheLatestBlockIsRequestedViaTheSdk() {

        console.info("Given that the latest block is requested via the sdk");

        await this.casperClient.nodeClient.getLatestBlockInfo().then(latestBlock => {
            this.contextMap.put("blockDataSdk", latestBlock);
            this.contextMap.put("latestBlock", (<any>latestBlock).block.hash);
        });
    }

    @then(/^request the latest block via the test node$/)
    public requestTheLatestBlockViaTheTestNode() {
        console.info("Then request the latest block via the test node");

        this.contextMap.put("blockDataNode", this.nctl.getChainBlock(this.contextMap.get('latestBlock')));
    }

    @then(/^the body of the returned block is equal to the body of the returned test node block$/)
    public theBodyOfTheReturnedBlockIsEqualToTheBodyOfTheReturnedTestNodeBlock() {

        console.info("Then the body of the returned block is equal to the body of the returned test node block");

        const latestBlockSdk: any = this.contextMap.get("blockDataSdk");
        const latestBlockNode: any = this.contextMap.get("blockDataNode");

        expect(latestBlockSdk.block.body.proposer).to.be.eql(latestBlockNode.body.proposer);

        expect(latestBlockSdk.block.body.deploy_hashes).to.not.be.undefined;
        expect(latestBlockSdk.block.body.transfer_hashes).to.not.be.undefined;
    }

    @then(/^the hash of the returned block is equal to the hash of the returned test node block$/)
    public theHashOfTheReturnedBlockIsEqualToTheHashOfTheReturnedTestNodeBlock() {
        console.info("And the hash of the returned block is equal to the hash of the returned test node block");

        const latestBlockSdk: any = this.contextMap.get("blockDataSdk");
        const latestBlockNode: any = this.contextMap.get("blockDataNode");

        expect(latestBlockSdk.block.hash).to.be.eql(latestBlockNode.hash);
    }

    @then(/^the header of the returned block is equal to the header of the returned test node block$/)
    public theHeaderOfTheReturnedBlockIsEqualToTheHeaderOfTheReturnedTestNodeBlock() {
        console.info("And the header of the returned block is equal to the header of the returned test node block");

        const latestBlockSdk: any = this.contextMap.get("blockDataSdk");
        const latestBlockNode: any = this.contextMap.get("blockDataNode");

        expect(latestBlockSdk.block.header.parent_hash).to.be.eql(latestBlockNode.header.parent_hash);
        expect(latestBlockSdk.block.header.state_root_hash).to.be.eql(latestBlockNode.header.state_root_hash);
        expect(latestBlockSdk.block.header.body_hash).to.be.eql(latestBlockNode.header.body_hash);
        expect(latestBlockSdk.block.header.random_bit).to.be.eql(latestBlockNode.header.random_bit);
        expect(latestBlockSdk.block.header.accumulated_seed).to.be.eql(latestBlockNode.header.accumulated_seed);
        expect(latestBlockSdk.block.header.era_end).to.be.eql(latestBlockNode.header.era_end);
        expect(latestBlockSdk.block.header.timestamp).to.be.eql(latestBlockNode.header.timestamp);
        expect(latestBlockSdk.block.header.era_id).to.be.eql(latestBlockNode.header.era_id);
        expect(latestBlockSdk.block.header.height).to.be.eql(latestBlockNode.header.height);
        expect(latestBlockSdk.block.header.protocol_version).to.be.eql(latestBlockNode.header.protocol_version);
    }

    @then(/^the proofs of the returned block are equal to the proofs of the returned test node block$/)
    public theProofsOfTheReturnedBlockAreEqualToTheProofsOfTheReturnedTestNodeBlock() {

        console.info("And the proofs of the returned block are equal to the proofs of the returned test node block");

        const latestBlockSdk: any = this.contextMap.get("blockDataSdk");
        const latestBlockNode: any = this.contextMap.get("blockDataNode");

        expect(latestBlockSdk.block.proofs.length).to.be.gte(4);

        expect(latestBlockSdk.block.proofs.length).to.be.eql(latestBlockNode.proofs.length);

        for (const [index, proof] of latestBlockSdk.block.proofs.entries()) {
            const nctlProof = latestBlockNode.proofs[index];
            expect(proof.public_key).to.be.eql(nctlProof.public_key);
            expect(proof.signature).to.be.eql(nctlProof.signature);
        }
    }

    @given(/^that a block is returned by hash via the sdk$/)
    public async thatABlockIsReturnedByHashViaTheSdk() {
        console.info("Given that a block is returned by hash via the sdk");

        await this.casperClient.nodeClient.getBlockInfo(this.contextMap.get("latestBlock")).then(blockResult => {
            this.contextMap.put('blockDataSdk', blockResult);
        });
    }

    @given(/^that a block is returned by height (\d+) via the sdk$/)
    public async thatABlockIsReturnedByHeightViaTheSdk(height: number) {
        console.info("Given that a block is returned by height [{}] via the sdk", height);

        await this.casperClient.nodeClient.getBlockInfoByHeight(height).then(blockResult => {
            this.contextMap.put('blockDataSdk', blockResult);
            this.contextMap.put('blockHashSdk', blockResult.block?.hash);
        });
    }

    @given(/^that an invalid block hash is requested via the sdk$/)
    public async thatAnInvalidBlockHashIsRequestedViaTheSdk() {
        console.info("Given that an invalid block hash is requested via the sdk");


        await this.casperClient.nodeClient.getBlockInfo(this.invalidBlockHash).catch(e => {
            this.contextMap.put("csprClientException", e);
        });
    }

    @then(/^request a block by hash via the test node$/)
    public requestABlockByHashViaTheTestNode() {
        console.info("Then request a block by hash via the test node");

        let chainBlock = this.nctl.getChainBlock(this.contextMap.get('latestBlock'));
        this.contextMap.put('blockNodeData', chainBlock);
    }

    @then(/^a valid error message is returned$/)
    public aValidErrorMessageIsReturned() {

        console.info("Then a valid error message is returned");

        const csprClientException: any = this.contextMap.get("csprClientException");

        expect(csprClientException.message).to.be.not.null;
        expect(csprClientException.message).to.be.eql('block not known');
        expect(csprClientException.code).to.be.eql(-32001);
    }

    @then(/^the deploy response contains a valid deploy hash$/)
    public theDeployResponseContainsAValidDeployHash() {

        console.info("Then the deploy response contains a valid deploy hash");
        const deployResult: any = this.contextMap.get("deployResult");
        expect(deployResult).to.not.be.null;
        expect(deployResult).to.not.be.undefined;


    }

    @then(/^request the block transfer$/, undefined, 320000)
    public async requestTheBlockTransfer() {

        console.info("Then request the block transfer");

        const deployResult: any = this.contextMap.get("deployResult");

        await EventUtils.waitForABlockAddedEventWithATimoutOfSeconds(this.casperClient, deployResult, 300).then(event => {
            this.contextMap.put('lastBlockAdded', event.body.BlockAdded);
        });

       await this.casperClient.nodeClient.getBlockTransfers().then(transfers => {
           this.contextMap.put("transferBlockSdk", transfers);
        });

        // TODO await events

        /* DeployResult deployResult = contextMap.get("deployResult");

         ExpiringMatcher<Event<BlockAdded>> matcher = (ExpiringMatcher<Event<BlockAdded>>) blockEventHandler.addEventMatcher(
            EventType.MAIN,
            hasTransferHashWithin(
                deployResult.getDeployHash(),
                blockAddedEvent -> contextMap.put("matchingBlock", blockAddedEvent.getData())
            )
        );

        assertThat(matcher.waitForMatch(300), is(true));
        blockEventHandler.removeEventMatcher(EventType.MAIN, matcher);

        contextMap.put("transferBlockSdk", getCasperService().getBlockTransfers());*/

    }


    @then(/^request the returned block from the test node via its hash$/)
    public requestTheReturnedBlockFromTheTestNodeViaItsHash() {
        console.info("Then request the returned block from the test node via its hash");

        //NCTL doesn't have get block via height, so we use the sdk's returned block has
        this.contextMap.put("blockDataNode", this.nctl.getChainBlock(this.contextMap.get("blockHashSdk")));
    }

    @given(/^that a test node era switch block is requested$/)
    public thatATestNodeEraSwitchBlockIsRequested() {

        console.info("Given that a test node era switch block is requested");

        // contextMap.put("nodeEraSwitchBlockResult", nctl.getChainEraInfo());
    }

    @then(/^wait for the the test node era switch block step event$/)
    public waitForTheTheTestNodeEraSwitchBlock() {
        console.info("Then wait for the test node era switch block step event");

        /*  ExpiringMatcher<Event<Step>> matcher = (ExpiringMatcher<Event<Step>>) eraEventHandler.addEventMatcher(
             EventType.MAIN,
             EraMatcher.theEraHasChanged()
         );

         assertThat(matcher.waitForMatch(5000L), is(true));

          JsonNode result = nctl.getChainEraInfo();

         eraEventHandler.removeEventMatcher(EventType.MAIN, matcher);

         assertThat(result.get("era_summary").get("block_hash").textValue(), is(notNullValue()));
         validateBlockHash(new Digest(result.get("era_summary").get("block_hash").textValue()));

         contextMap.put("nodeEraSwitchBlock", result.get("era_summary").get("block_hash").textValue());
         contextMap.put("nodeEraSwitchData", result);*/
    }

    @then(/^request the block transfer from the test node$/)
    public requestTheBlockTransferFromTheTestNode() {

        console.info("Then request the block transfer from the test node");

        /*  TransferData transferData = contextMap.get("transferBlockSdk");
         contextMap.put("transferBlockNode", nctl.getChainBlockTransfers(transferData.getBlockHash()));*/
    }

    @then(/^the switch block hashes of the returned block are equal to the switch block hashes of the returned test node block$/)
    public theSwitchBlockHashesOfTheReturnedBlockAreEqualToTheSwitchBlockHashesOfTheReturnedTestNodeBlock() {

        console.info("And the switch block hashes of the returned block are equal to the switch block hashes of the returned test node block");

        /*    EraInfoData data = contextMap.get("eraSwitchBlockData");

           assertThat(contextMap.get("nodeEraSwitchBlock").equals(data.getEraSummary().getBlockHash()), is(true));*/
    }

    @then(/^the switch block eras of the returned block are equal to the switch block eras of the returned test node block$/)
    public theSwitchBlockErasOfTheReturnedBlockAreEqualToTheSwitchBlockErasOfTheReturnedTestNodeBlock() {
        console.info("And the switch block eras are equal");

        /*     EraInfoData data = contextMap.get("eraSwitchBlockData");
             JsonNode node = mapper.readTree(contextMap.get("nodeEraSwitchData").toString());

            assertThat(node.get("era_summary").get("era_id").toString().equals(data.getEraSummary().getEraId().toString()), is(true));*/
    }

    @then(/^the switch block merkle proofs of the returned block are equal to the switch block merkle proofs of the returned test node block$/)
    public theSwitchBlockMerkleProofsOfTheReturnedBlockAreEqualToTheSwitchBlockMerkleProofsOfTheReturnedTestNodeBlock() {
        console.info("And the switch block merkle proofs of the returned block are equal to the switch block merkle proofs of the returned test node block");

        /* EraInfoData data = contextMap.get("eraSwitchBlockData");
         JsonNode node = mapper.readTree(contextMap.get("nodeEraSwitchData").toString());

        assertThat(data.getEraSummary().getMerkleProof(), is(isValidMerkleProof(node.get("era_summary").get("merkle_proof").asText())));

         Digest digest = new Digest(data.getEraSummary().getMerkleProof());
        assertThat(digest.isValid(), is(true));*/
    }

    @then(/^the switch block state root hashes of the returned block are equal to the switch block state root hashes of the returned test node block$/)
    public theSwitchBlockStateRootHashesOfTheReturnedBlockAreEqualToTheSwitchBlockStateRootHashesOfTheReturnedTestNodeBlock() {

        console.info("And the switch block state root hashes of the returned block are equal to the switch block state root hashes of the returned test node block");

        /* EraInfoData data = contextMap.get("eraSwitchBlockData");
         JsonNode node = mapper.readTree(contextMap.get("nodeEraSwitchData").toString());

        assertThat(node.get("era_summary").get("state_root_hash").asText().equals(data.getEraSummary().getStateRootHash()), is(true));*/
    }

    @then(/^the delegators data of the returned block is equal to the delegators data of the returned test node block$/)
    public theDelegatorsDataOfTheReturnedBlockIsEqualToTheDelegatorsDataOfTheReturnedTestNodeBlock() {
        console.info("And the delegators data of the returned block is equal to the delegators data of the returned test node block");

        /*EraInfoData data = contextMap.get("eraSwitchBlockData");
        JsonNode allocations = mapper.readTree(contextMap.get("nodeEraSwitchData").toString())
           .get("era_summary").get("stored_value").get("EraInfo").get("seigniorage_allocations");

        List<SeigniorageAllocation> delegatorsSdk = data.getEraSummary()
           .getStoredValue().getValue().getSeigniorageAllocations()
           .stream()
           .filter(q -> q instanceof Delegator)
           .map(d -> (Delegator) d)
   .collect(Collectors.toList());

       allocations.findValues("Delegator").forEach(
           d -> {
                List<SeigniorageAllocation> found = delegatorsSdk
                   .stream()
                   .filter(q -> getPublicKey(d.get("delegator_public_key").asText()).equals(((Delegator) q).getDelegatorPublicKey()))
           .collect(Collectors.toList());

               assertThat(found.isEmpty(), is(false));
               assertThat(d.get("validator_public_key").asText().equals(((Delegator) found.get(0)).getValidatorPublicKey().toString()), is(true));
               assertThat(d.get("amount").asText().equals(found.get(0).getAmount().toString()), is(true));
           }
       );*/
    }

    @then(/^the validators data of the returned block is equal to the validators data of the returned test node block$/)
    public theValidatorsDataOfTheReturnedBlockIsEqualToTheValidatorsDataOfTheReturnedTestNodeBlock() {

        console.info("And the validators data of the returned block is equal to the validators data of the returned test node block");

        /*EraInfoData data = contextMap.get("eraSwitchBlockData");

        JsonNode allocations = mapper.readTree(contextMap.get("nodeEraSwitchData").toString())
           .get("era_summary").get("stored_value").get("EraInfo").get("seigniorage_allocations");

        List<SeigniorageAllocation> validatorsSdk = data.getEraSummary()
           .getStoredValue().getValue().getSeigniorageAllocations()
           .stream()
           .filter(q -> q instanceof Validator)
           .map(d -> (Validator) d)
   .collect(Collectors.toList());

       allocations.findValues("Validator").forEach(
           d -> {
                List<SeigniorageAllocation> found = validatorsSdk
                   .stream()
                   .filter(q -> getPublicKey(d.get("validator_public_key").asText()).equals(((Validator) q).getValidatorPublicKey()))
           .collect(Collectors.toList());

               assertThat(found.isEmpty(), is(false));
               assertThat(d.get("amount").asText().equals(found.get(0).getAmount().toString()), is(true));
           }
       );*/
    }

    @given(/^that chain transfer data is initialised$/)
    public thatChainTransferDataIsInitialised() {
        console.info("Given that chain transfer data is initialised");

        const senderKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-1/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const receiverKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-2/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);

        expect(senderKeyPair).to.not.be.undefined;
        expect(receiverKeyPair).to.not.be.undefined;

        this.contextMap.put("senderKeyPair", senderKeyPair);
        this.contextMap.put("receiverKeyPair", receiverKeyPair);
        this.contextMap.put("transferAmount",2500000000);
        this.contextMap.put("gasPrice", 1);
        this.contextMap.put("ttlMinutes", "30m");
    }

    @when(/^the deploy data is put on chain$/)
    public async theDeployDataIsPutOnChain() {
        console.info("When the deploy data is put on chain");

        const amount = BigNumber.from(this.contextMap.get('transferAmount'));
        const receiverKeyPair = this.contextMap.get('receiverKeyPair') as any;
        const senderKeyPair = this.contextMap.get('senderKeyPair') as any;
        const id = BigNumber.from(Math.round(Math.random()));
        const gasPrice: number = this.contextMap.get('gasPrice');
        const ttl = DeployUtil.dehumanizerTTL(this.contextMap.get('ttlMinutes'));

        const transfer = DeployUtil.ExecutableDeployItem.newTransfer(amount, receiverKeyPair.publicKey, undefined, id);
        expect(transfer).to.not.be.undefined;

        const standardPayment = DeployUtil.standardPayment(BigNumber.from(100000000));
        expect(standardPayment).to.not.be.undefined;

        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, "casper-net-1", gasPrice, ttl);
        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        this.casperClient.signDeploy(deploy, senderKeyPair);

        await this.casperClient.putDeploy(deploy).then(deployResult => {
            this.contextMap.put("deployResult", deployResult);
        }).catch(e => {
            console.error(e);
            fail(e);
        });

        const hash = encodeBase16(deploy.hash);
        this.contextMap.put('putDeploy', deploy);
        this.contextMap.put("deployResult", hash);
        expect(this.contextMap.get('deployResult')).to.not.be.null;
    }

    @then(/^the returned block contains the transfer hash returned from the test node block$/)
    public theReturnedBlockContainsTheTransferHashReturnedFromTheTestNodeBlock() {

        console.info("And the returned block contains the transfer hash returned from the test node block");

        const deployResult = this.contextMap.get("deployResult");

        expect(deployResult).to.not.be.undefined;
        /*
           List<String> transferHashes = new ArrayList<>();

          mapper.readTree(contextMap.get("transferBlockNode").toString()).get("body").get("transfer_hashes").forEach(
              t -> {
                  if (t.textValue().equals(deployResult.getDeployHash())) {
                      transferHashes.add(t.textValue());
                  }
              }
          );

          assertThat(transferHashes.size() > 0, is(true));*/
    }


    @given(/^that an invalid block height is requested via the sdk$/)
    public thatAnInvalidBlockHeightIsRequestedViaTheSdk() {

        console.info("Given that an invalid block height is requested");

        /*contextMap.put("csprClientException",
            assertThrows(CasperClientException.class,
                () -> getCasperService().getBlock(new HeightBlockIdentifier(invalidHeight)))
        );*/
    }

    @then(/^request the corresponding era switch block via the sdk$/)
    public requestTheCorrespondingEraSwitchBlockViaTheSdk() {
        console.info("Then request the corresponding era switch block via the sdk");

        // contextMap.put("eraSwitchBlockData", getCasperService().getEraInfoBySwitchBlock(new HashBlockIdentifier(contextMap.get("nodeEraSwitchBlock"))));
    }

    @given(/^that a step event is received$/)
    public thatAStepEventIsReceived() {
        console.info("Then wait for the test node era switch block step event");

        /* ExpiringMatcher<Event<Step>> matcher = (ExpiringMatcher<Event<Step>>) eraEventHandler.addEventMatcher(
            EventType.MAIN,
            EraMatcher.theEraHasChanged()
        );

        assertThat(matcher.waitForMatch(5000L), is(true));

         JsonNode result = nctl.getChainEraInfo();

        eraEventHandler.removeEventMatcher(EventType.MAIN, matcher);

        assertThat(result.get("era_summary").get("block_hash").textValue(), is(notNullValue()));
        validateBlockHash(new Digest(result.get("era_summary").get("block_hash").textValue()));

        contextMap.put("nodeEraSwitchBlock", result.get("era_summary").get("block_hash").textValue());
        contextMap.put("nodeEraSwitchData", result);
    */
    }

    private getPublicKey(key: string): any {
        /* try {
          PublicKey publicKey = new PublicKey();
         publicKey.createPublicKey(key);
         return publicKey;
     } catch (NoSuchAlgorithmException e) {
         throw new RuntimeException(e);
     }*/
    }

    private validateBlockHash(hash: string) {
        /* assertThat(hash, is(notNullValue()));
         assertThat(hash.getDigest(), is(notNullValue()));
         assertThat(hash.getClass(), is(Digest.class));
         assertThat(hash.isValid(), is(true));*/
    }
}
