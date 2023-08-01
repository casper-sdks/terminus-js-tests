import {binding, given, then} from "cucumber-tsflow";
import {ContextMap} from "../utils/context-map";

/**
 * The class that implements the steps for the deploys_generated_keys.feature.
 *
 * @author ian@meywood.com
 */
@binding()
export class DeploysGeneratedKeysSteps {
    private contextMap = ContextMap.getInstance();

    @given(/^that a "([^"]*)" sender key is generated$/)
    public thatSenderKeyIsGenerated(algo: string) {

        console.info(`that a ${algo} sender key is generated`);
        /*
             AbstractPrivateKey sk;
             AbstractPublicKey pk;

            if (algo.equals("Ed25519")) {
            sk = CasperKeyHelper.createRandomEd25519Key();
            pk = CasperKeyHelper.derivePublicKey((Ed25519PrivateKey) sk);
        } else {
            sk = CasperKeyHelper.createRandomSecp256k1Key();
            pk = CasperKeyHelper.derivePublicKey((Secp256k1PrivateKey) sk);


        }

        assertThat(sk, is(notNullValue()));
        assertThat(pk, is(notNullValue()));

        byte[] msg = "this is the sender".getBytes();
        byte[] signature = sk.sign(msg);
        assertTrue(pk.verify(msg, signature));

        assertThat(sk.getKey(), is(notNullValue()));
        assertThat(pk.getKey(), is(notNullValue()));

        contextMap.put(SENDER_KEY_SK, sk);
        contextMap.put(SENDER_KEY_PK, pk);
        */
    }


    @given(/^that a "([^"]*)" receiver key is generated$/)
    public thatAReceiverKeyIsGenerated(algo: string) {

        console.info(`that a ${algo} receiver key is generated`);
        /*
             AbstractPublicKey pk;
             AbstractPrivateKey sk;

            if (algo.equals("Ed25519")) {
                sk = CasperKeyHelper.createRandomEd25519Key();
                pk = CasperKeyHelper.derivePublicKey((Ed25519PrivateKey) sk);
            } else {
                sk = CasperKeyHelper.createRandomSecp256k1Key();
                pk = CasperKeyHelper.derivePublicKey((Secp256k1PrivateKey) sk);
            }

            byte[] msg = "this is the receiver".getBytes();
            byte[] signature = sk.sign(msg);
            assertTrue(pk.verify(msg, signature));

            assertThat(sk.getKey(), is(notNullValue()));
            assertThat(pk.getKey(), is(notNullValue()));

            contextMap.put(RECEIVER_KEY, pk);
        */
    }

    @then(/^fund the account from the faucet user with a transfer amount of (\d+) and a payment amount of (\d+)$/)
    public fundTheAccountFromTheFaucetUserWithATransferAmountOfAndAPaymentAmountOf(transferAmount: number, paymentAmount: number) {
        console.info(`fund the account from the faucet user with a transfer amount of ${transferAmount} and a payment amount of ${paymentAmount}`);
        /*
             URL faucetPrivateKeyUrl = AssetUtils.getFaucetAsset(1, "secret_key.pem");
            assertThat(faucetPrivateKeyUrl, is(notNullValue()));
             Ed25519PrivateKey privateKey = new Ed25519PrivateKey();
            privateKey.readPrivateKey(faucetPrivateKeyUrl.getFile());

            contextMap.put(TRANSFER_AMOUNT, transferAmount);
            contextMap.put(PAYMENT_AMOUNT, paymentAmount);

            doDeploy(privateKey, contextMap.get(SENDER_KEY_PK));
        */
    }

    @then(/^wait for a block added event with a timeout of (\d+) seconds$/)
    public waitForABlockAddedEventWithATimeoutOfSeconds(timeout: number) {

        console.info(`Then wait for a block added event with a timeout of ${timeout} seconds`);
        /* 
     
         final DeployResult deployResult = contextMap.get(DEPLOY_RESULT);
     
         final ExpiringMatcher<Event<BlockAdded>> matcher = (ExpiringMatcher<Event<BlockAdded>>) eventHandler.addEventMatcher(
             EventType.MAIN,
         hasTransferHashWithin(
             deployResult.getDeployHash(),
         blockAddedEvent -> contextMap.put(LAST_BLOCK_ADDED, blockAddedEvent.getData())
     )
     );
     
         assertThat(matcher.waitForMatch(timeout), is(true));
     
         eventHandler.removeEventMatcher(EventType.MAIN, matcher);
     
         final Digest matchingBlockHash = ((BlockAdded) contextMap.get(LAST_BLOCK_ADDED)).getBlockHash();
         assertThat(matchingBlockHash, is(notNullValue()));
     
         final JsonBlockData block = CasperClientProvider.getInstance().getCasperService().getBlock(new HashBlockIdentifier(matchingBlockHash.toString()));
         assertThat(block, is(notNullValue()));
         final List<String> transferHashes = block.getBlock().getBody().getTransferHashes();
         assertThat(transferHashes, hasItem(deployResult.getDeployHash()));
     */
    }

    @then(/^transfer to the receiver account the transfer amount of (\d+) and the payment amount of (\d+)$/)
    public transferToTheReceiverAccountTheTransferAmountOfAndThePaymentAmountOf(transferAmount: number, paymentAmount: number) {
        console.info(`transfer to the receiver account the transfer amount of ${transferAmount} and the payment amount of ${paymentAmount}`);
        /*
            contextMap.put(TRANSFER_AMOUNT, transferAmount);
            contextMap.put(PAYMENT_AMOUNT, paymentAmount);

            doDeploy(contextMap.get(SENDER_KEY_SK), contextMap.get(RECEIVER_KEY));
        */
    }

    @then(/^the returned block header proposer contains the "([^"]*)" algo$/)
    public theReturnedBlockHeaderProposerContainsTheAlgo(algo: string) {
        console.info(`the returned block header proposer contains the ${algo} algo`);
        /*
             Digest matchingBlockHash = ((BlockAdded) contextMap.get(LAST_BLOCK_ADDED)).getBlockHash();
             JsonBlockData block = CasperClientProvider.getInstance().getCasperService().getBlock(new HashBlockIdentifier(matchingBlockHash.toString()));

            assertThat(block.getBlock().getBody().getProposer().getTag().toString().toUpperCase(), is(algo.toUpperCase(Locale.ROOT)));
        */
    }

    private doDeploy(sk: any, pk: any) {
        /*
             Deploy deploy = CasperTransferHelper.buildTransferDeploy(
                sk,
                PublicKey.fromAbstractPublicKey(pk),
                BigInteger.valueOf(contextMap.get(TRANSFER_AMOUNT)),
                "casper-net-1",
                Math.abs(new Random().nextLong()),
                BigInteger.valueOf(contextMap.get(PAYMENT_AMOUNT)),
                1L,
                Ttl.builder().ttl("30m").build(),
                new Date(),
                new ArrayList<>());

            contextMap.put(PUT_DEPLOY, deploy);

             CasperService casperService = CasperClientProvider.getInstance().getCasperService();

            contextMap.put(DEPLOY_RESULT, casperService.putDeploy(deploy));
        */
    }
}



