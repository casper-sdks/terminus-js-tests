import {binding, given, then} from "cucumber-tsflow";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {expect} from "chai";
import {SimpleRpcClient} from "../utils/simple-rpc-client";
import {fail} from "assert";

/**
 * state_get_auction_info feature step definitions.
 */
@binding()
export class StateGetAuctionInfoSteps {

    /** The client under test */
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    /** The map used to share results and variables across step definitions. */
    private contextMap = ContextMap.getInstance();
    private simpleRpcClient = new SimpleRpcClient(
        TestParameters.getInstance().getHostname(),
        TestParameters.getInstance().getRcpPort()
    );


    @given(/^that the state_get_auction_info RPC method is invoked by hash block identifier$/, undefined, 10000)
    public async thatTheState_get_auction_infoRPCMethodIsInvoked() {
        console.info("Given that the state_get_auction_info RPC method is invoked by hash block identifier");

        this.contextMap.clear();

        await this.casperClient.nodeClient.getLatestBlockInfo().then(lastBlock => {
            this.contextMap.put("parentHash", lastBlock.block?.header.parent_hash);
        });

        let parentHash: string = this.contextMap.get("parentHash");
        expect(parentHash).to.not.be.null;

        let rawJson = await this.simpleRpcClient.getAuctionInfoByHash(parentHash);
        expect(rawJson).to.not.be.undefined;
        this.contextMap.put('rawJson', rawJson);

        await this.casperClient.nodeClient.getValidatorsInfo(parentHash).then(validatorsInfoResult => {
            this.contextMap.put("validatorsInfoResult", validatorsInfoResult);
        });
    }


    @given(/^that the state_get_auction_info RPC method is invoked by height block identifier$/)
    public async thatTheState_get_auction_infoRPCMethodIsInvokedByHeightBlockIdentifier() {
        console.info("Given that the state_get_auction_info RPC method is invoked by height block identifier");

        this.contextMap.clear();

        await this.casperClient.nodeClient.getLatestBlockInfo().then(lastBlock => {
            this.contextMap.put("parentHash", lastBlock.block?.header.parent_hash);
        });

        let parentHash: string = this.contextMap.get("parentHash");
        expect(parentHash).to.not.be.null;

        let rawJson = await this.simpleRpcClient.getAuctionInfoByHash(parentHash);
        expect(rawJson).to.not.be.undefined;
        this.contextMap.put('rawJson', rawJson);

        await this.casperClient.nodeClient.getValidatorsInfoByBlockHeight(rawJson.result.auction_state.block_height).then(validatorsInfoResult => {
            this.contextMap.put("validatorsInfoResult", validatorsInfoResult);
        });
    }

    @then(/^a valid state_get_auction_info_result is returned$/)
    public aValidState_get_auction_info_resultIsReturned() {
        console.info("Given a valid state_get_auction_info_result is returned");

        expect(this.contextMap.get("validatorsInfoResult")).to.not.be.undefined;
    }

    @then(/^the state_get_auction_info_result has and api version of "([^"]*)"$/)
    public theState_get_auction_info_resultHasAndApiVersionOf(apiVersion: string) {
        console.info("And the state_get_auction_info_result has and api version of {}", apiVersion);
        let validatorsInfoResult: any = this.contextMap.get("validatorsInfoResult");
        expect(validatorsInfoResult.api_version).to.be.eql(apiVersion);
    }

    @then(/^the state_get_auction_info_result action_state has a valid state root hash$/)
    public theState_get_auction_info_resultAction_stateHasAValidStateRootHash() {

        const validatorsInfoResult: any = this.contextMap.get("validatorsInfoResult");
        const rawJson: any = this.contextMap.get('rawJson');

        expect(validatorsInfoResult.auction_state.state_root_hash).to.be.eql(rawJson.result.auction_state.state_root_hash);
    }

    @then(/^the state_get_auction_info_result action_state has a valid height$/)
    public theState_get_auction_info_resultAction_stateHasAValidHeight() {

        const validatorsInfoResult: any = this.contextMap.get("validatorsInfoResult");
        const rawJson: any = this.contextMap.get('rawJson');

        expect(validatorsInfoResult.auction_state.block_height).to.be.eql(rawJson.result.auction_state.block_height);
    }

    @then(/^the state_get_auction_info_result action_state has valid bids$/)
    public theState_get_auction_info_resultAction_stateHasValidBids() {

        const validatorsInfoResult: any = this.contextMap.get("validatorsInfoResult");
        const rawJson: any = this.contextMap.get('rawJson');

        expect(validatorsInfoResult.auction_state.bids.length).to.be.gt(1);
        expect(validatorsInfoResult.auction_state.bids.length).to.be.eql(rawJson.result.auction_state.bids.length);

        let firstBid = validatorsInfoResult.auction_state.bids[0];
        let jsonFirstBid = rawJson.result.auction_state.bids[0];
        expect(firstBid.public_key).to.be.eql(jsonFirstBid.public_key);
        expect(firstBid.bid.bonding_purse).to.be.contain('uref-');
        expect(firstBid.bid.delegation_rate).to.be.eql(jsonFirstBid.bid.delegation_rate);
        expect(firstBid.bid.staked_amount).to.be.eql(jsonFirstBid.bid.staked_amount);
        expect(firstBid.bid.inactive).to.be.eql(jsonFirstBid.bid.inactive);
    }


    @then(/^the state_get_auction_info_result action_state has valid era validators$/)
    public theState_get_auction_info_resultAction_stateHasValidEraValidators() {

        const validatorsInfoResult: any = this.contextMap.get("validatorsInfoResult");
        const rawJson: any = this.contextMap.get('rawJson');

        expect(validatorsInfoResult.auction_state.era_validators.length).to.be.gt(1);
        expect(validatorsInfoResult.auction_state.era_validators.length).to.be.gt(1);

        expect(validatorsInfoResult.auction_state.era_validators.length).to.be.eql(rawJson.result.auction_state.era_validators.length);

        const firstValidator = validatorsInfoResult.auction_state.era_validators[0];
        const rawFirstValidator = rawJson.result.auction_state.era_validators[0];
        expect(firstValidator.era_id).to.be.eql(rawFirstValidator.era_id);
        expect(firstValidator.validator_weights[0].public_key).to.be.eql(rawFirstValidator.validator_weights[0].public_key);
        expect(firstValidator.validator_weights[0].weight).to.be.eql(rawFirstValidator.validator_weights[0].weight);
    }

    @given(/^that the state_get_auction_info RPC method is invoked by an invalid block hash identifier$/)
    public async thatTheState_get_auction_infoRPCMethodIsInvokedByAnInvalidHeightBlockIdentifier() {

        this.contextMap.clear();

        let pass = false;

        // noinspection JSUnusedLocalSymbols
        await this.casperClient.nodeClient.getValidatorsInfo("9608b4b7029a18ae35373eab879f523850a1b1fd43a3e6da774826a343af4ad2").then(validatorsInfoResult => {
            fail('Should have thrown');
        }).catch(e => {
            expect(e.message).to.be.eql('No such block');
            expect(e.code).to.be.eql(-32001);
            pass = true;
        });

        expect(pass).to.be.true;
    }
}
