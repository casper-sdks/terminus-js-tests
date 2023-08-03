import {binding, given, then} from "cucumber-tsflow";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {CasperClient} from "casper-js-sdk";
import {expect} from "chai";
import {SimpleRpcClient} from "../utils/simple-rpc-client";
import {EraSummary} from "casper-js-sdk/dist/services/CasperServiceByJsonRPC";


/**
 * The steps for the era feature.
 */
@binding()
export class EraSteps {

    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private simpleRpcClient = new SimpleRpcClient(
        TestParameters.getInstance().getHostname(),
        TestParameters.getInstance().getRcpPort()
    );

    @given(/^that the era summary is requested via the sdk$/)
    public async thatTheEraSummaryIsRequested() {

        console.info("that the era summary is requested via the sdk");

        let blockResult = await this.casperClient.nodeClient.getLatestBlockInfo();

        expect(blockResult).to.not.be.undefined;

        const blockHash = (blockResult.block as any).hash;
        this.contextMap.put('blockHash', blockHash);

        let eraSummary = await this.casperClient.nodeClient.getEraSummary(blockHash);

        expect(eraSummary).to.not.be.undefined;

        this.contextMap.put('eraSummary', eraSummary);
    }

    @then(/^request the era summary via the node$/)
    public async requestTheEraSummaryViaTheNode() {

        const blockHash: string = this.contextMap.get('blockHash');
        const rawJson: any = await this.simpleRpcClient.getEraSummary(blockHash);

        this.contextMap.put('nodeEraSummary', rawJson.result.era_summary)
    }


    @then(/^the block hash of the returned era summary is equal to the block hash of the test node era summary$/)
    public theBlockHashOfTheReturnedEraSummaryIsEqualToTheBlockHashOfTheTestNodeEraSummary() {

        console.info("And the block hash of the returned era summary is equal to the block hash of the test node era summary");

        const eraSummary: EraSummary = this.contextMap.get("eraSummary");
        const nodeEraSummary: any = this.contextMap.get("nodeEraSummary");

        expect(eraSummary.blockHash).to.be.eql(nodeEraSummary.block_hash);
    }

    @then(/^the era of the returned era summary is equal to the era of the returned test node era summary$/)
    public theEraOfTheReturnedEraSummaryIsEqualToTheEraOfTheReturnedTestNodeEraSummary() {

        console.info("And the era of the returned era summary is equal to the era of the returned test node era summary");

        const eraSummary: EraSummary = this.contextMap.get("eraSummary");
        const nodeEraSummary: any = this.contextMap.get("nodeEraSummary");

        expect(eraSummary.eraId).to.be.eql(nodeEraSummary.era_id);
    }

    @then(/^the merkle proof of the returned era summary is equal to the merkle proof of the returned test node era summary$/)
    public theMerkleProofOfTheReturnedEraSummaryIsEqualToTheMerkleProofOfTheReturnedTestNodeEraSummary() {

        console.info("And the merkle proof of the returned era summary is equal to the merkle proof of the returned test node era summary");

        // NOT SUPPORTED IN JavaScript SDK

        /*
        const eraSummary: EraSummary = this.contextMap.get("eraSummary");
        const nodeEraSummary: any = this.contextMap.get("nodeEraSummary");
        expect(eraSummary.merkleProof).to.be.eql(nodeEraSummary.merkle_proof)
         */
    }

    @then(/^the state root hash of the returned era summary is equal to the state root hash of the returned test node era summary$/)
    public theStateRootHashOfTheReturnedEraSummaryIsEqualToTheStateRootHashOfTheReturnedTestNodeEraSummary() {

        console.info("And the state root hash of the returned era summary is equal to the state root hash of the returned test node era summary");

        const eraSummary: EraSummary = this.contextMap.get("eraSummary");
        const nodeEraSummary: any = this.contextMap.get("nodeEraSummary");

        expect(eraSummary.stateRootHash).to.be.eql(nodeEraSummary.state_root_hash);
    }


    @then(/^the delegators data of the returned era summary is equal to the delegators data of the returned test node era summary$/)
    public theDelegatorsDataOfTheReturnedEraSummaryIsEqualToTheDelegatorsDataOfTheReturnedTestNodeEraSummary() {

        console.info("And the delegators data of the returned era summary is equal to the delegators data of the returned test node era summary");

        throw "NOT SUPPORTED IN JavaScript SDK";
    }

    @then(/^the validators data of the returned era summary is equal to the validators data of the returned test node era summary$/)
    public theValidatorsDataOfTheReturnedEraSummaryIsEqualToTheValidatorsDataOfTheReturnedTestNodeEraSummary() {

        console.info("And the validators data of the returned era summary is equal to the validators data of the returned test node era summary");

        throw "NOT SUPPORTED IN JavaScript SDK";
    }
}