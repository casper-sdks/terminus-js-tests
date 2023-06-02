import {binding, given, then} from "cucumber-tsflow";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {expect} from "chai";
import {fail} from "assert";
import {ValidatorsInfoResult} from "casper-js-sdk/dist/services/CasperServiceByJsonRPC";

/**
 * state_get_auction_info feature step definitions.
 */
@binding()
export class StateGetAuctionInfoSteps {

    /** The client under test */
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    /** The map used to share results and variables across step definitions. */
    private contextMap = ContextMap.getInstance();


    @given(/^that the state_get_auction_info RPC method is invoked by hash block identifier$/)
    public async thatTheState_get_auction_infoRPCMethodIsInvoked() {
        console.info("Given that the state_get_auction_info RPC method is invoked by hash block identifier");


         await this.casperClient.nodeClient.getLatestBlockInfo().then(lastBlock => {
             this.contextMap.put("parentHash", lastBlock.block?.header.parent_hash);
         });

        let parentHash: string = this.contextMap.get("parentHash");
        expect(parentHash).to.not.be.null;

       // fail("state_get_auction_info not implemented")

       await this.casperClient.nodeClient.getValidatorsInfo(parentHash).then(validatorsInfoResult => {
           this.contextMap.put("validatorsInfoResult", validatorsInfoResult);
       });

       // TODO get using simple RPC service for comparison

       expect(this.contextMap.get("validatorsInfoResult")).to.not.be.undefined;


        /* final JsonBlockData block = casperService.getBlock();
         final String parentHash = block.getBlock().getHeader().getParentHash().toString();
         contextMap.put("parentHash", parentHash);


     
         final JsonNode auctionInfoByHash = simpleRcpClient.getAuctionInfoByHash(parentHash).at("/result");
         assertThat(auctionInfoByHash, is(notNullValue()));
         contextMap.put(STATE_AUCTION_INFO_JSON, auctionInfoByHash);
     
         // We have to compare to current block (which may change) as nctl does not allow to spe which block to use
         // The only way to resole this is to use curl and compare against the JSON.
         final AuctionData auctionData = casperService.getStateAuctionInfo(new HashBlockIdentifier(parentHash));
         contextMap.put(STATE_GET_AUCTION_INFO_RESULT, auctionData);
     */
    }


    @given(/^that the state_get_auction_info RPC method is invoked by height block identifier$/)
    public thatTheState_get_auction_infoRPCMethodIsInvokedByHeightBlockIdentifier() {
        console.info("Given that the state_get_auction_info RPC method is invoked by height block identifier");

        /*    final JsonBlockData currentBlock = casperService.getBlock();
            final String parentHash = currentBlock.getBlock().getHeader().getParentHash().toString();
            final JsonBlockData block = casperService.getBlock(new HashBlockIdentifier(parentHash));
        
            final JsonNode stateAuctionInfoJson = simpleRcpClient.getAuctionInfoByHash(parentHash).at("/result");
            assertThat(stateAuctionInfoJson, is(notNullValue()));
            contextMap.put(STATE_AUCTION_INFO_JSON, stateAuctionInfoJson);
        
            final AuctionData auctionData = casperService.getStateAuctionInfo(new HeightBlockIdentifier(block.getBlock().getHeader().getHeight()));
            contextMap.put(STATE_GET_AUCTION_INFO_RESULT, auctionData); */
    }

    @then(/^a valid state_get_auction_info_result is returned$/)
    public aValidState_get_auction_info_resultIsReturned() {
        console.info("Given a valid state_get_auction_info_result is returned");
        /* final AuctionData auctionData = contextMap.get(STATE_GET_AUCTION_INFO_RESULT);
         assertThat(auctionData, is(notNullValue()));*/
    }

    @then(/^the state_get_auction_info_result has and api version of "([^"]*)"$/)
    public theState_get_auction_info_resultHasAndApiVersionOf(apiVersion: string) {
        console.info("And the state_get_auction_info_result has and api version of {}", apiVersion);
        /*   final AuctionData auctionData = contextMap.get(STATE_GET_AUCTION_INFO_RESULT);
           assertThat(auctionData.getApiVersion(), is(apiVersion));*/
    }

    @then(/^the state_get_auction_info_result action_state has a valid state root hash$/)
    public theState_get_auction_info_resultAction_stateHasAValidStateRootHash() {
        /*  final AuctionData auctionData = contextMap.get(STATE_GET_AUCTION_INFO_RESULT);
          final JsonNode jsonNode = contextMap.get(STATE_AUCTION_INFO_JSON);
          final String expectedStateRootHash = jsonNode.at("/auction_state/state_root_hash").asText();
          assertThat(auctionData.getAuctionState().getStateRootHash(), is(expectedStateRootHash));*/
    }

    @then(/^the state_get_auction_info_result action_state has a valid height$/)
    public theState_get_auction_info_resultAction_stateHasAValidHeight() {
        /* final AuctionData auctionData = contextMap.get(STATE_GET_AUCTION_INFO_RESULT);
         final JsonNode jsonNode = contextMap.get(STATE_AUCTION_INFO_JSON);
         final Long expectedBlockHeight = jsonNode.at("/auction_state/block_height").asLong();
         assertThat(auctionData.getAuctionState().getHeight(), is(expectedBlockHeight));*/
    }

    @then(/^the state_get_auction_info_result action_state has valid bids$/)
    public theState_get_auction_info_resultAction_stateHasValidBids() {
        /* final AuctionData auctionData = contextMap.get(STATE_GET_AUCTION_INFO_RESULT);
         assertThat(auctionData.getAuctionState().getBids().size(), is(greaterThan(0)));
     
         final JsonNode jsonNode = contextMap.get(STATE_AUCTION_INFO_JSON);
         final JsonNode bidsJson = jsonNode.at("/auction_state/bids");
         assertThat(auctionData.getAuctionState().getBids().size(), is(bidsJson.size()));
     
         final String publicKey = bidsJson.at("/0/public_key").asText();
         JsonBids firstBid = auctionData.getAuctionState().getBids().get(0);
         assertThat(firstBid.getPublicKey().getAlgoTaggedHex(), is(publicKey));
     
         final String bondingPurse = bidsJson.at("/0/bid/bonding_purse").asText();
         assertThat(firstBid.getBid().getBondingPurse().getJsonURef(), is(bondingPurse));
     
         final int delegationRate = bidsJson.at("/0/bid/delegation_rate").asInt();
         assertThat(firstBid.getBid().getDelegationRate(), is(delegationRate));
     
         final boolean inactive = bidsJson.at("/0/bid/inactive").asBoolean();
         assertThat(firstBid.getBid().isInactive(), is(inactive));
     
         final BigInteger stakedAmount = new BigInteger(bidsJson.at("/0/bid/staked_amount").asText());
         assertThat(firstBid.getBid().getStakedAmount(), is(stakedAmount));
     
         final String delegatorBondingPurse = bidsJson.at("/0/bid/delegators/0/bonding_purse").asText();
         assertThat(firstBid.getBid().getDelegators().get(0).getBondingPurse().getJsonURef(), is(delegatorBondingPurse));
     
         final String delegatee = bidsJson.at("/0/bid/delegators/0/delegatee").asText();
         assertThat(firstBid.getBid().getDelegators().get(0).getDelegatee().getAlgoTaggedHex(), is(delegatee));
     
         final String delegateePublicKey = bidsJson.at("/0/bid/delegators/0/public_key").asText();
         final PublicKey pubKey = firstBid.getBid().getDelegators().get(0).getPublicKey();
         assertThat(pubKey.getAlgoTaggedHex(), is(delegateePublicKey));
     
         final BigInteger delegateeStakedAmount = new BigInteger(bidsJson.at("/0/bid/delegators/0/staked_amount").asText());
         assertThat(firstBid.getBid().getDelegators().get(0).getStakedAmount(), is(delegateeStakedAmount));*/
    }


    @then(/^the state_get_auction_info_result action_state has valid era validators$/)
    public theState_get_auction_info_resultAction_stateHasValidEraValidators() {
        /*final AuctionData auctionData = contextMap.get(STATE_GET_AUCTION_INFO_RESULT);
    
        assertThat(auctionData.getAuctionState().getEraValidators().size(), is(greaterThan(0)));
    
        final JsonNode jsonNode = contextMap.get(STATE_AUCTION_INFO_JSON);
        final JsonNode eraValidatorsJson = jsonNode.at("/auction_state/era_validators");
        assertThat(eraValidatorsJson.size(), is(greaterThan(0)));
    
        final JsonNode firstValidatorJson = eraValidatorsJson.at("/0");
        final JsonEraValidators firstValidator = auctionData.getAuctionState().getEraValidators().get(0);
        assertThat(firstValidator.getEraId(), is(new BigInteger(firstValidatorJson.at("/era_id").asText())));
    
        assertThat(firstValidator.getValidatorWeights().size(), is(greaterThan(0)));
    
        final JsonValidatorWeight weight = firstValidator.getValidatorWeights().get(0);
        assertThat(weight.getPublicKey().getAlgoTaggedHex(), is(firstValidatorJson.at("/validator_weights/0/public_key").asText()));
    
        assertThat(weight.getWeight(), is(new BigInteger(firstValidatorJson.at("/validator_weights/0/weight").asText())));*/
    }

    @given(/^that the state_get_auction_info RPC method is invoked by an invalid block hash identifier$/)
    public thatTheState_get_auction_infoRPCMethodIsInvokedByAnInvalidHeightBlockIdentifier() {
        /* try {
             casperService.getStateAuctionInfo(new HashBlockIdentifier("9608b4b7029a18ae35373eab879f523850a1b1fd43a3e6da774826a343af4ad2"));
         } catch (CasperClientException e) {
             contextMap.put(CLIENT_EXCEPTION, e);
         }*/
    }
}
