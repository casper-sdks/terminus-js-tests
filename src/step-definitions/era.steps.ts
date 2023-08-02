import {binding, given, then} from "cucumber-tsflow";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {CasperClient} from "casper-js-sdk";


/**
 * The steps for the era feature.
 */
@binding()
export class EraSteps {

    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private testProperties = TestParameters.getInstance();

    //  private  SimpleRcpClient simpleRcpClient = new SimpleRcpClient(testProperties.getHostname(), testProperties.getRcpPort());

    @given(/^that the era summary is requested via the sdk$/)
    public thatTheEraSummaryIsRequested() {

        console.info("that the era summary is requested via the sdk");
        /*
                 JsonBlockData block = casperService.getBlock();
                assertThat(block, is(notNullValue()));

                contextMap.put("blockHash", block.getBlock().getHash().toString());

                 EraInfoData eraSummary = casperService.getEraSummary(new HashBlockIdentifier(contextMap.get("blockHash")));
                assertThat(block, is(notNullValue()));

                contextMap.put("eraSummary", eraSummary);

         */
    }

    @then(/^request the era summary via the node$/)
    public requestTheEraSummaryViaTheNode() {
        /*
             JsonNode nodeEraSummary = simpleRcpClient.getEraSummary(contextMap.get("blockHash"));

            contextMap.put("nodeEraSummary", nodeEraSummary.get("result").get("era_summary"));

         */
    }


    @then(/^the block hash of the returned era summary is equal to the block hash of the test node era summary$/)
    public theBlockHashOfTheReturnedEraSummaryIsEqualToTheBlockHashOfTheTestNodeEraSummary() {

        console.info("And the block hash of the returned era summary is equal to the block hash of the test node era summary");
        /*
             EraInfoData eraSummary = contextMap.get("eraSummary");
             JsonNode nodeEraSummary = contextMap.get("nodeEraSummary");
             String blockHash = nodeEraSummary.get("block_hash").textValue();

            assertThat(blockHash.equals(eraSummary.getEraSummary().getBlockHash()), is(true));


         */

    }

    @then(/^the era of the returned era summary is equal to the era of the returned test node era summary$/)
    public theEraOfTheReturnedEraSummaryIsEqualToTheEraOfTheReturnedTestNodeEraSummary() {

        console.info("And the era of the returned era summary is equal to the era of the returned test node era summary");
        /*
             EraInfoData eraSummary = contextMap.get("eraSummary");
             JsonNode nodeEraSummary = contextMap.get("nodeEraSummary");
             Long eraId = nodeEraSummary.get("era_id").asLong();

            assertThat(eraId, is(eraSummary.getEraSummary().getEraId()));


         */
    }

    @then(/^the merkle proof of the returned era summary is equal to the merkle proof of the returned test node era summary$/)
    public theMerkleProofOfTheReturnedEraSummaryIsEqualToTheMerkleProofOfTheReturnedTestNodeEraSummary() {

        console.info("And the merkle proof of the returned era summary is equal to the merkle proof of the returned test node era summary");
        /*
             EraInfoData eraSummary = contextMap.get("eraSummary");
             JsonNode nodeEraSummary = contextMap.get("nodeEraSummary");

            assertThat(eraSummary.getEraSummary().getMerkleProof().equals(nodeEraSummary.get("merkle_proof").asText()), is(true));

             Digest digest = new Digest(eraSummary.getEraSummary().getMerkleProof());
            assertThat(digest.isValid(), is(true));


         */
    }

    @then(/^the state root hash of the returned era summary is equal to the state root hash of the returned test node era summary$/)
    public theStateRootHashOfTheReturnedEraSummaryIsEqualToTheStateRootHashOfTheReturnedTestNodeEraSummary() {

        console.info("And the state root hash of the returned era summary is equal to the state root hash of the returned test node era summary");
        /*
             EraInfoData eraSummary = contextMap.get("eraSummary");
             JsonNode nodeEraSummary = contextMap.get("nodeEraSummary");

            assertThat(nodeEraSummary.get("state_root_hash").asText().equals(eraSummary.getEraSummary().getStateRootHash()), is(true));
        */
    }


    @then(/^the delegators data of the returned era summary is equal to the delegators data of the returned test node era summary$/)
    public theDelegatorsDataOfTheReturnedEraSummaryIsEqualToTheDelegatorsDataOfTheReturnedTestNodeEraSummary() {

        console.info("And the delegators data of the returned era summary is equal to the delegators data of the returned test node era summary");
        /*
             EraInfoData eraSummary = contextMap.get("eraSummary");
             JsonNode nodeEraSummary = contextMap.get("nodeEraSummary");

             JsonNode allocations = nodeEraSummary.get("stored_value").get("EraInfo").get("seigniorage_allocations");

             List<SeigniorageAllocation> delegatorsSdk = eraSummary.getEraSummary()
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
            );

         */
    }

    @then(/^the validators data of the returned era summary is equal to the validators data of the returned test node era summary$/)
    public theValidatorsDataOfTheReturnedEraSummaryIsEqualToTheValidatorsDataOfTheReturnedTestNodeEraSummary() {

        console.info("And the validators data of the returned era summary is equal to the validators data of the returned test node era summary");
        /*
             EraInfoData eraSummary = contextMap.get("eraSummary");
             JsonNode nodeEraSummary = contextMap.get("nodeEraSummary");

             JsonNode allocations = nodeEraSummary.get("stored_value").get("EraInfo").get("seigniorage_allocations");

             List<SeigniorageAllocation> validatorsSdk = eraSummary.getEraSummary()
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
            );


         */
    }

    private getPublicKey(key: string) {
        /*
    try {
         PublicKey publicKey = new PublicKey();
        publicKey.createPublicKey(key);
        return publicKey;
    } catch (NoSuchAlgorithmException e) {
        throw new RuntimeException(e);
    }

         */

    }
}