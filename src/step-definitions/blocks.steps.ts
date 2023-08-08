import {ContextMap} from "../utils/context-map";
import {NctlClient} from "../utils/nctl-client";
import {TestParameters} from "../utils/test-parameters";
import {CasperClient, DeployUtil, encodeBase16, Keys} from "casper-js-sdk";
import {expect} from "chai";
import {binding, given, then, when} from "cucumber-tsflow";
import {BigNumber} from "@ethersproject/bignumber";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";

/**
 * The steps for the blocks feature
 */
@binding()
export class BlocksSteps {

    private invalidBlockHash = "2fe9630b7790852e4409d815b04ca98f37effcdf9097d317b9b9b8ad658f47c8";
    private invalidHeight = 9999999999;
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
        // noinspection JSUnresolvedReference
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
        // noinspection JSUnresolvedReference
        expect(latestBlockSdk.block.header.accumulated_seed).to.be.eql(latestBlockNode.header.accumulated_seed);
        // noinspection JSUnresolvedReference
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
        expect(csprClientException.code).to.be.eql(-32001);
        expect(csprClientException.message).to.be.eql('No such block');
    }

    @then(/^the deploy response contains a valid deploy hash$/)
    public theDeployResponseContainsAValidDeployHash() {

        console.info("Then the deploy response contains a valid deploy hash");
        const deployResult: string = this.contextMap.get("deployResult");
        expect(deployResult).to.not.be.null;
        expect(deployResult).to.not.be.undefined;
    }

    @then(/^request the block transfer$/, undefined, 320000)
    public async requestTheBlockTransfer() {

        console.info("Then request the block transfer");

        const deploy: Deploy = this.contextMap.get('putDeploy');
        const deployResult = await this.casperClient.nodeClient.waitForDeploy(deploy, 300000);
        const transfers = await this.casperClient.nodeClient.getBlockTransfers(deployResult.execution_results[0].block_hash);
        this.contextMap.put('blockHash', deployResult.execution_results[0].block_hash);
        this.contextMap.put("transferBlockSdk", transfers);
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
        this.contextMap.put('nodeEraSwitchBlockResult', this.nctl.getChainEraInfo());
    }

    @then(/^request the block transfer from the test node$/)
    public requestTheBlockTransferFromTheTestNode() {

        console.info("Then request the block transfer from the test node");

        let blockHash: string = this.contextMap.get('blockHash');

        this.contextMap.put('transferBlockNode', this.nctl.getChainBlockTransfers(blockHash));
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
        this.contextMap.put("transferAmount", 2500000000);
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

        const deployResult = await this.casperClient.putDeploy(deploy);
        expect(deployResult).to.not.be.null;
        this.contextMap.put('deployResult', deployResult);

        const hash = encodeBase16(deploy.hash);
        this.contextMap.put('putDeploy', deploy);
        this.contextMap.put("deployResult", hash);
    }

    @then(/^the returned block contains the transfer hash returned from the test node block$/)
    public theReturnedBlockContainsTheTransferHashReturnedFromTheTestNodeBlock() {

        console.info("And the returned block contains the transfer hash returned from the test node block");

        const deployResult = this.contextMap.get("deployResult");

        expect(deployResult).to.not.be.undefined;

        const transferBlockNode: any = this.contextMap.get('transferBlockNode');

        expect(transferBlockNode).to.not.be.undefined;
        // noinspection JSUnresolvedReference
        expect(transferBlockNode.body.transfer_hashes.length).to.be.eql(1);
        expect(transferBlockNode.body.transfer_hashes[0]).to.be.eql(deployResult);
    }

    @given(/^that an invalid block height is requested via the sdk$/)
    public async thatAnInvalidBlockHeightIsRequestedViaTheSdk() {

        console.info("Given that an invalid block height is requested");

        const blockInfo = await this.casperClient.nodeClient.getBlockInfoByHeight(this.invalidHeight)
            .catch(error => {
                expect(error.message).to.be.eql('No such block');
            });

        expect(blockInfo).to.be.undefined;
    }
}
