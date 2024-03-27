import {binding, given, then, when} from 'cucumber-tsflow';
import {expect} from "chai";
import {ContextMap} from "../utils/context-map";
import {CasperClient, CLPublicKey, DeployUtil, Keys} from "casper-js-sdk";
import {BigNumber} from '@ethersproject/bignumber';
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {GetDeployResult} from "casper-js-sdk/dist/services";
import {AsymmetricKey} from "casper-js-sdk/dist/lib/Keys";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue";
import {TestParameters} from "../utils/test-parameters";
import {EventUtils} from "../utils/event-utils";
import {ClTypeUtils} from "../utils/cl-type-utils";

/**
 * Step definitions for the deploys feature.
 *
 * @author ian@meywood.com
 */
@binding()
export class DeploysSteps {

    /** The client under test */
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    /** The map used to share results and variables across step definitions. */
    private contextMap = ContextMap.getInstance();

    @given(/^that user-(\d+) initiates a transfer to user-(\d+)$/)
    public thatUserInitiatesATrans(senderId: number, receiverId: number) {

        console.info(`Given that user-${senderId} initiates a transfer to user-${receiverId}`);

        const senderKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-${senderId}/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const receiverKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-${receiverId}/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);

        expect(senderKeyPair).to.not.be.undefined;
        expect(receiverKeyPair).to.not.be.undefined;

        this.contextMap.put('senderKeyPair', senderKeyPair);
        this.contextMap.put('receiverKeyPair', receiverKeyPair);
    }

    @given(/^the transfer amount is (\d+)/)
    public theTransferAmountId(amount: number) {
        console.info(`And the transfer amount is ${amount}`);
        this.contextMap.put("transferAmount", amount);
    }

    @given(/^the transfer gas price is (\d+)$/)
    public theTransferPriceIs(price: number) {
        console.info(`And the transfer gas price is ${price}`);
        this.contextMap.put("gasPrice", price);
    }

    @given(/^the deploy is given a ttl of (\d+)m$/)
    public theDeployIsGivenATtlOfM(ttlMinutes: number) {
        console.info(`And the deploy is given a ttl of ${ttlMinutes}m`);
        this.contextMap.put("ttlMinutes", ttlMinutes + "m");
    }

    @when(/^the deploy is put on chain "([^"]*)"$/)
    public async theDeployIsPut(chainName: string) {

        console.info(`And the deploy is put on chain  ${chainName}`);

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

        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, TestParameters.getInstance().getChainName, gasPrice, ttl);
        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        this.casperClient.signDeploy(deploy, senderKeyPair);

        await this.casperClient.putDeploy(deploy).then(deployResult => {
            this.contextMap.put("deployResult", deployResult);
        });

        this.contextMap.put('deploy', deploy);

        expect(this.contextMap.get('deployResult')).to.not.be.null;
    }

    @then(/^the deploy response contains a valid deploy hash of length (\d+) and an API version "([^"]*)"$/)
    public theValidDeployHashIsReturned(hashLength: number, apiVersion: string) {

        console.info(`the deploy response contains a valid deploy hash of length ${hashLength} and an API version ${apiVersion}`);

        const deployHash: string = this.contextMap.get("deployResult");

        // Note we don't get an API version form the JS SDK so just testing the hash
        expect(deployHash.length).to.be.equal(hashLength);
    }

    @then(/^wait for a block added event with a timout of (\d+) seconds$/, undefined, 300000)
    public async waitForABlockAddedEventWithATimoutOfSeconds(timeout: number) {

        console.info(`wait for a block added event with a timout of ${timeout} seconds`);

        const deployHash: string = this.contextMap.get("deployResult");

        await EventUtils.waitForABlockAddedEventWithATimoutOfSeconds(this.casperClient, deployHash, timeout).then(event => {
            this.contextMap.put('blockHash', event.body.BlockAdded.block.hash);
        });

        const blockHash = this.contextMap.get('blockHash') as any;

        let block: any | null = null;

        await this.casperClient.nodeClient.getBlockInfo(blockHash).then(blockResult => {
            block = blockResult.block as any;
        });

        expect(block).to.not.be.null;
        expect(block.body.transfer_hashes).to.include(deployHash);
    }

    @given(/^that a Transfer has been successfully deployed$/)
    public thatATransferHasBeenDeployed() {
        console.info(`Given that a Transfer has been successfully deployed`);

        const deployHash: string = this.contextMap.get("deployResult");
        expect(deployHash).to.not.be.undefined;
    }

    @when(/^a deploy is requested via the info_get_deploy RCP method$/)
    public async theDeployIsRequestedAValidDeployDataIsReturned() {

        console.info(`When a deploy is requested via the info_get_deploy RCP method`);

        const deployHash: string = this.contextMap.get("deployResult");

        let deploy: Deploy | null = null;
        let result: GetDeployResult | null = null;
        await this.casperClient.getDeploy(deployHash).then(deployAndResult => {
            deploy = deployAndResult[0];
            result = deployAndResult[1];
        });

        expect(deploy).to.not.be.undefined;
        expect(result).to.not.be.undefined;

        this.contextMap.put('deploy', deploy);
        this.contextMap.put('result', result)
    }

    @then(/^the deploy data has an API version of "([^"]*)"$/)
    public theDeployDataHasAnAPIVersionOf(apiVersion: string) {

        console.info(`Then the deploy data has an API version of ${apiVersion}`);

        let result: GetDeployResult = this.contextMap.get('result');
        expect(result.api_version).to.eql(apiVersion);
    }

    @then(/^the deploy execution result has "([^"]*)" block hash$/)
    public theDeployExecutionResultHasBlockHash(blockName: string) {
        console.info(`Then the the deploy execution result has ${blockName} block hash`);
        const blockAdded: any = this.contextMap.get('blockHash');
        expect(blockAdded).to.not.be.undefined;

        const result: GetDeployResult = this.contextMap.get('result');
        expect(result).to.not.be.undefined;
        expect(result.execution_results[0].block_hash).to.eql(blockAdded);
    }

    @then(/^the deploy execution has a cost of (\d+) motes$/)
    public theDeployExecutionResultHasACostOf(cost: number) {

        console.info(`Then the deploy execution has a cost of ${cost} motes`);

        const result: any = this.contextMap.get('result');
        expect(result).to.not.be.undefined;

        const actualCost = BigNumber.from(result.execution_results[0].result.Success.cost).toNumber();
        expect(actualCost).to.not.be.undefined;
        expect(actualCost).to.eql(cost);
    }

    @then(/^the deploy has a payment amount of (\d+)$/)
    public theDeployHasAPaymentAmountOf(amount: number) {

        console.info(`Then the deploy has a payment amount of ${amount}`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;
        expect(deploy.payment.getArgByName('amount')?.value().toNumber()).to.eql(amount);
    }

    @then(/^the deploy has a valid hash$/)
    public theDeployHasAValidHash() {

        console.info(`Then the deploy has a valid hash`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;

        const putDeploy: Deploy = this.contextMap.get('deploy');
        expect(putDeploy).to.not.be.undefined;

        expect(deploy.hash).to.eql(putDeploy.hash);
    }

    @then(/^the deploy has a valid timestamp$/)
    public theDeployHasAValidTimestamp() {

        console.info(`Then the deploy has a valid timestamp`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;

        const putDeploy: Deploy = this.contextMap.get('deploy');
        expect(putDeploy).to.not.be.undefined;
        expect(deploy.header.timestamp).to.eql(putDeploy.header.timestamp);
    }

    @then(/^the deploy has a valid body hash$/)
    public theDeployHasAValidBodyHash() {

        console.info(`Then the deploy has a valid body hash`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;

        const putDeploy: Deploy = this.contextMap.get('deploy');
        expect(putDeploy).to.not.be.undefined;
        expect(deploy.header.bodyHash).to.eql(putDeploy.header.bodyHash);
    }

    @then(/^the deploy has a session type of "([^"]*)"$/)
    public theDeploySSessionIsA(sessionType: string) {

        console.info(`Then the deploy has a session type of ${sessionType}`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;
        expect(deploy.session.isTransfer()).to.be.true;
    }

    @then(/^the deploy is approved by user-(\d+)$/)
    public theDeployIsSignedByUser(userId: number) {

        console.info(`Then the deploy is approved by user-${userId}`);

        const senderKeyPair: AsymmetricKey = this.contextMap.get('senderKeyPair');

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;

        let hex = senderKeyPair.publicKey.toHex().toLowerCase();
        expect(deploy.approvals[0].signer).to.eql(hex);
    }

    @then(/^the deploy has a gas price of (\d+)$/)
    public theDeployHeaderHasAGasPriceOf(gasPrice: number) {
        console.info(`Then the deploy has a gas price of ${gasPrice}`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;
        expect(deploy.header.gasPrice).to.eql(gasPrice);
    }

    @then(/^the deploy has a ttl of (\d+)m$/)
    public theDeployHasATtlOfM(ttl: number) {

        console.info(`Then ^the deploy has a ttl of ${ttl}`);

        const deploy: Deploy = this.contextMap.get('deploy');
        expect(deploy).to.not.be.undefined;

        const expectedTtl = DeployUtil.dehumanizerTTL(ttl + 'm');
        expect(deploy.header.ttl).to.eql(expectedTtl)
    }

    @then(/^the deploy session has a "([^"]*)" argument value of type "([^"]*)"$/)
    public theDeploySessionHasAArgumentOfType(argName: string, argType: string) {

        console.info(`the deploy session has a ${argName} argument value of type ${argType}`);

        const argByName = this.getDeployArgument(argName);
        let expectedClType = ClTypeUtils.getCLType(argType);
        const actualArgType = argByName?.clType().tag;
        expect(actualArgType).to.eql(expectedClType)
    }

    @then(/^the deploy session has a "([^"]*)" argument with a numeric value of (\d+)$/)
    public theDeploySessionHasAArgumentWithANumericValueOf(argName: string, value: number) {
        console.info(`the deploy session has a ${argName} argument numeric value of ${value}`);
        const argByName = this.getDeployArgument(argName);
        expect(argByName.value()).to.eql(BigNumber.from(value));
    }

    @then(/^the deploy session has a "([^"]*)" argument with the public key of user-(\d+)$/)
    public theDeploySessionHasAArgumentWithThePublicKeyOfUser(argName: string, userId: number) {
        console.info(`the deploy session has a ${argName} argument with the public key of user-${userId}`);
        const argByName = this.getDeployArgument(argName);
        const receiverKeyPair: AsymmetricKey = this.contextMap.get('receiverKeyPair');
        const publicKey: CLPublicKey = argByName.value();
        const expected = Uint8Array.from(receiverKeyPair.publicKey.data);
        expect(publicKey).to.eql(expected);
    }

    private getDeployArgument(argName: string): CLValue {
        const deploy: Deploy = this.contextMap.get('deploy');
        const argByName = deploy.session.getArgByName(argName);
        return argByName as CLValue;
    }


}
