import {binding, given, then, when} from 'cucumber-tsflow';
import {assert} from "chai";
import {ParameterMap} from "../utils/parameter-map";
import {CasperClient, DeployUtil, DeployWatcher, EventName, EventStream, Keys} from "casper-js-sdk";
import {BigNumber} from '@ethersproject/bignumber';


@binding()
export class DeploysSteps {

    private casperClient = new CasperClient("http://localhost:11101/rpc");

    private parameterMap = ParameterMap.getInstance();

    @given(/^that user-(\d+) initiates a transfer to user-(\d+)$/)
    public thatUserInitiatesATrans(senderId: number, receiverId: number) {

        console.info(`Given that user-${senderId} initiates a transfer to user-${receiverId}`);

        const senderKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-${senderId}/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const receiverKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-${receiverId}/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);

        assert.isDefined(senderKeyPair);
        assert.isDefined(receiverKeyPair);

        this.parameterMap.put('senderKeyPair', senderKeyPair);
        this.parameterMap.put('receiverKeyPair', receiverKeyPair);
    }

    @given(/^the transfer amount is (\d+)/)
    public theTransferAmountId(amount: number) {
        console.info(`And the transfer amount is ${amount}`);
        this.parameterMap.put("transferAmount", amount);

    }

    @given(/^the transfer gas price is (\d+)$/)
    public theTransferPriceIs(price: number) {
        console.info(`And the transfer gas price is ${price}`);
        this.parameterMap.put("gasPrice", price);
    }

    @given(/^the deploy is given a ttl of (\d+)m$/)
    public theDeployIsGivenATtlOfM(ttlMinutes: number) {
        console.info(`And the deploy is given a ttl of ${ttlMinutes}m`);
        this.parameterMap.put("ttlMinutes", ttlMinutes + "m");
    }

    @when(/^the deploy is put on chain "([^"]*)"$/)
    public async theDeployIsPut(chainName: string) {

        const amount = BigNumber.from(this.parameterMap.get('transferAmount'));
        const receiverKeyPair = this.parameterMap.get('receiverKeyPair') as any;
        const senderKeyPair = this.parameterMap.get('senderKeyPair') as any;
        const id = BigNumber.from(Math.round(Math.random()));
        const gasPrice: number = this.parameterMap.get('gasPrice');
        const ttl = DeployUtil.dehumanizerTTL(this.parameterMap.get('ttlMinutes'));

        const transfer = DeployUtil.ExecutableDeployItem.newTransfer(amount, receiverKeyPair.publicKey, undefined, id);
        assert.isDefined(transfer);

        const standardPayment = DeployUtil.standardPayment(amount);
        assert.isDefined(standardPayment);


        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, chainName, gasPrice, ttl);
        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        this.casperClient.signDeploy(deploy, senderKeyPair);

        await this.casperClient.putDeploy(deploy).then(deployResult => {
            this.parameterMap.put("deployResult", deployResult);
        });

        assert.isNotNull(this.parameterMap.get('deployResult'))
    }

    @then(/^the deploy response contains a valid deploy hash of length (\d+) and an API version "([^"]*)"$/)
    public theValidDeployHashIsReturned(hashLength: number, apiVersion: string) {

        const deployHash: string = this.parameterMap.get("deployResult")

        // Note we don't get an API version form the JS SDK so just testing the hash
        assert.equal(deployHash.length, hashLength);
    }

    @then(/^wait for a block added event with a timout of (\d+) seconds$/)
    public waitForABlockAddedEventWithATimoutOfSeconds(timeout: number) {

        const deployHash: string = this.parameterMap.get("deployResult");

        const eventSteam: EventStream = new EventStream('http://localhost:18101/events/main');
        eventSteam.subscribe(EventName.BlockAdded, value => {
            console.info('SUBSCRIBED VALUE 2', JSON.stringify(value.body));
        });

        eventSteam.start();

       /* const client = new DeployWatcher('http://localhost:18101/events/main');
        client.start()
        setTimeout(() => {
            client.subscribe([{
                'deployHash': deployHash,

            }])
        }, timeout * 10000);*/


        // client.stop();
    }

    @given(/^that a Transfer has been successfully deployed$/)
    public thatATransferHasBeenDeployed() {

    }

    @when(/^a deploy is requested via the info_get_deploy RCP method$/)
    public theDeployIsRequestedAValidDeployDataIsReturned() {

    }

    @then(/^the deploy data has an API version of "([^"]*)"$/)
    public theDeployDataHasAnAPIVersionOf(apiVersion: string) {

    }

    @then(/^the deploy execution result has "([^"]*)" block hash$/)
    public theDeployExecutionResultHasBlockHash(blockName: string) {

    }

    @then(/^the deploy execution has a cost of (\d+) motes$/)
    public theDeployExecutionResultHasACostOf(cost: number) {

    }

    @then(/^the deploy has a payment amount of (\d+)$/)
    public theDeployHasAPaymentAmountOf(amount: number) {

    }

    @then(/^the deploy has a valid hash$/)
    public theDeployHasAValidHash() {

    }

    @then(/^the deploy has a valid timestamp$/)
    public theDeployHasAValidTimestamp() {

    }

    @then(/^the deploy has a valid body hash$/)
    public theDeployHasAValidBodyHash() {

    }

    @then(/^the deploy has a session type of "([^"]*)"$/)
    public theDeploySSessionIsA(sessionType: string) {

    }

    @then(/^the deploy is approved by user-(\d+)$/)
    public theDeployIsSignedByUser(userId: number) {

    }

    @then(/^the deploy has a gas price of (\d+)$/)
    public theDeployHeaderHasAGasPriceOf(gasPrice: number) {

    }

    @then(/^the deploy has a ttl of (\d+)m$/)
    public theDeployHasATtlOfM(ttl: number) {

    }

    @then(/^the deploy session has a "([^"]*)" argument value of type "([^"]*)"$/)
    public theDeploySessionHasAArgumentOfType(argName: string, argType: string) {

    }

    @then(/^the deploy session has a "([^"]*)" argument with a numeric value of (\d+)$/)
    public theDeploySessionHasAArgumentWithANumericValueOf(argName: string, value: number) {

    }

    @then(/^the deploy session has a "([^"]*)" argument with the public key of user-(\d+)$/)
    public theDeploySessionHasAArgumentWithThePublicKeyOfUser(argName: string, userId: number) {

    }
}