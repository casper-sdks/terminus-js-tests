import {ContextMap} from "../utils/context-map";
import {Node} from "../utils/node";
import {TestParameters} from "../utils/test-parameters";
import {CasperClient} from "casper-js-sdk";
import {expect} from "chai";
import {binding, given, then} from "cucumber-tsflow";
import {SimpleRpcClient} from "../utils/simple-rpc-client";

/**
 * The steps for the blocks feature
 */
@binding()
export class BlocksSteps {

    private invalidBlockHash = "2fe9630b7790852e4409d815b04ca98f37effcdf9097d317b9b9b8ad658f47c8";
    private invalidHeight = 9999999999;
    private contextMap = ContextMap.getInstance();
    private node = new Node(TestParameters.getInstance().dockerName);
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private chainName = TestParameters.getInstance().chainName;
    private simpleRpcClient = new SimpleRpcClient(
        TestParameters.getInstance().getHostname(),
        TestParameters.getInstance().getRcpPort()
    );


    @given(/^that the latest block is requested via the sdk$/)
    public async thatTheLatestBlockIsRequestedViaTheSdk() {

        console.info("Given that the latest block is requested via the sdk");

        await this.casperClient.nodeClient.getLatestBlockInfo().then(latestBlock => {
            this.contextMap.put("blockDataSdk", latestBlock.block_with_signatures);
            this.contextMap.put("latestBlock", (<any>latestBlock).block_with_signatures.block.Version2.hash);
        });
    }

    @then(/^request the latest block via the test node$/)
    public requestTheLatestBlockViaTheTestNode() {

        console.info("Then request the latest block via the test node");

        this.contextMap.put("blockDataNode", this.node.getChainBlock(this.contextMap.get('latestBlock')));
    }

    @then(/^the body of the returned block is equal to the body of the returned test node block$/)
    public theBodyOfTheReturnedBlockIsEqualToTheBodyOfTheReturnedTestNodeBlock() {

        console.info("Then the body of the returned block is equal to the body of the returned test node block");

        const latestBlockSdk: any = this.contextMap.get("blockDataSdk");
        const latestBlockNode: any = this.contextMap.get("blockDataNode");

        expect(latestBlockSdk.block.Version2.body).to.be.eql(latestBlockNode.block.Version2.body);
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

        const latestBlockSdkHeader: any = (<any>this.contextMap.get("blockDataSdk")).block.Version2.header;
        const latestBlockNodeHeader: any = (<any>this.contextMap.get("blockDataNode")).block.Version2.header;

        expect(latestBlockSdkHeader.parent_hash).to.be.eql(latestBlockNodeHeader.parent_hash);
        expect(latestBlockSdkHeader.state_root_hash).to.be.eql(latestBlockNodeHeader.state_root_hash);
        expect(latestBlockSdkHeader.body_hash).to.be.eql(latestBlockNodeHeader.body_hash);
        expect(latestBlockSdkHeader.random_bit).to.be.eql(latestBlockNodeHeader.random_bit);
        expect(latestBlockSdkHeader.accumulated_seed).to.be.eql(latestBlockNodeHeader.accumulated_seed);
        expect(latestBlockSdkHeader.era_end).to.be.eql(latestBlockNodeHeader.era_end);
        expect(latestBlockSdkHeader.timestamp).to.be.eql(latestBlockNodeHeader.timestamp);
        expect(latestBlockSdkHeader.era_id).to.be.eql(latestBlockNodeHeader.era_id);
        expect(latestBlockSdkHeader.height).to.be.eql(latestBlockNodeHeader.height);
        expect(latestBlockSdkHeader.protocol_version).to.be.eql(latestBlockNodeHeader.protocol_version);
        expect(latestBlockSdkHeader.proposer).to.be.eql(latestBlockNodeHeader.proposer);
        expect(latestBlockSdkHeader.current_gas_price).to.be.eql(latestBlockNodeHeader.current_gas_price);
        expect(latestBlockSdkHeader.last_switch_block_hash).to.be.eql(latestBlockNodeHeader.last_switch_block_hash);
    }

    @then(/^the proofs of the returned block are equal to the proofs of the returned test node block$/)
    public theProofsOfTheReturnedBlockAreEqualToTheProofsOfTheReturnedTestNodeBlock() {

        console.info("And the proofs of the returned block are equal to the proofs of the returned test node block");

        const latestBlockSdkProofs: any = (<any>this.contextMap.get("blockDataSdk")).proofs;
        const latestBlockNodeProofs: any = (<any>this.contextMap.get("blockDataNode")).proofs;

        expect(latestBlockSdkProofs.length).to.be.gte(4);

        expect(latestBlockSdkProofs.length).to.be.eql(latestBlockNodeProofs.length);

        for (const [index, proof] of latestBlockSdkProofs.entries()) {
            const nodeProof = latestBlockNodeProofs[index];
            expect(proof.public_key).to.be.eql(nodeProof.public_key);
            expect(proof.signature).to.be.eql(nodeProof.signature);
        }
    }

    @given(/^that a block is returned by hash via the sdk$/)
    public async thatABlockIsReturnedByHashViaTheSdk() {
        console.info("Given that a block is returned by hash via the sdk");

        await this.casperClient.nodeClient.getBlockInfo(this.contextMap.get("latestBlock")).then(blockResult => {
            this.contextMap.put('blockDataSdk', blockResult.block_with_signatures);
        });
    }

    @given(/^that a block is returned by height (\d+) via the sdk$/)
    public async thatABlockIsReturnedByHeightViaTheSdk(height: number) {
        console.info("Given that a block is returned by height [{}] via the sdk", height);

        await this.casperClient.nodeClient.getBlockInfoByHeight(height).then(blockResult => {
            this.contextMap.put('blockDataSdk', blockResult.block_with_signatures);
            this.contextMap.put('blockHashSdk', (<any>blockResult).block_with_signatures.block.Version2.hash);
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

        let chainBlock = this.node.getChainBlock(this.contextMap.get('latestBlock'));
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

    @then(/^request the returned block from the test node via its hash$/)
    public requestTheReturnedBlockFromTheTestNodeViaItsHash() {

        console.info("Then request the returned block from the test node via its hash");
        //CCTL doesn't have get block via height, so we use the sdk's returned block has
        this.contextMap.put("blockDataNode", this.node.getChainBlock(this.contextMap.get("blockHashSdk")));
    }

    @given(/^that a test node era switch block is requested$/)
    public thatATestNodeEraSwitchBlockIsRequested() {

        console.info("Given that a test node era switch block is requested");
        this.contextMap.put('nodeEraSwitchBlockResult', this.node.getChainEraInfo());
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

    @given(/^that (\d+) node transfers are initiated$/)
    public async thatNNodeTransfersAreInitiated(transfers:number){

        console.info("that a node transfer is initiated");

        this.contextMap.put('transfers', this.node.getTransfers(transfers));

    };

    @then(/^a list of (\d+) transaction hashes are generated$/)
    public async thatNTransactionHashesAreGenerated(transfers:number){

        console.info("a list of transactions is generated");

        expect(this.contextMap.get('transfers')).to.be.not.undefined;

        let _transfers: string[] = this.contextMap.get('transfers');

        expect(_transfers.length).to.be.eql(transfers);

    };

    @then(/^each transaction has a transacted block$/, '',50000)
    public async thatEachTransactionHasATransactedBlock(){

        console.info("that each transaction has a transacted block");

        let transfers: string[] = this.contextMap.get('transfers');
        let blockHashes: string[] = [];
        let transaction: any;

        for (const transfer of transfers) {

            transaction = await this.simpleRpcClient.getTransaction(transfer);

            if (transaction.result.execution_info === null){
                do{
                    await this.node.awaitNBlocks(5);
                    transaction = await this.simpleRpcClient.getTransaction(transfer);
                } while (transaction.result.execution_info === null)
            }

            blockHashes.push(transaction.result.execution_info.block_hash)

        }

        this.contextMap.put('blockHashes', blockHashes);

    };

    @then(/^the transactions of the SDK block equal the transactions on the node block$/)
    public async thatTheTransactionsOfTheSDKBlockEqualTheTransactionsOnTheNodeBlock(){

        console.info("that the transactions of the SDK block equal the transactions on the node block");

        let blockHashes: string[] = this.contextMap.get('blockHashes');

        for (const blockHash of blockHashes){
            await this.validateTransactions(blockHash);
        }


    };

    private async validateTransactions(blockHash: string): Promise<void> {

        let blockResultSdk = await this.casperClient.nodeClient.getBlockInfo(blockHash);
        let blockResultNode = await this.node.getChainBlock(blockHash);

        expect((<any>blockResultSdk).block_with_signatures.block.Version2.body.transactions).to.be.eql(blockResultNode.block.Version2.body.transactions);

    }

}
