import {binding, given, then} from "cucumber-tsflow";
import {ContextMap} from "../utils/context-map";
import {assert, expect} from "chai";
import {CasperClient, DeployUtil, GetBlockResult, Keys} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {BigNumber} from "@ethersproject/bignumber";
import {AsymmetricKey} from "casper-js-sdk/dist/lib/Keys";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {GetDeployResult} from "casper-js-sdk/dist/services";
import * as fs from "fs";

/**
 * The class that implements the steps for the deploys_generated_keys.feature.
 *
 * @author ian@meywood.com
 */
@binding()
export class DeploysGeneratedKeysSteps {

    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private contextMap = ContextMap.getInstance();

    @given(/^that a "([^"]*)" sender key is generated$/)
    public thatSenderKeyIsGenerated(algo: string) {

        console.info(`Given that a ${algo} sender key is generated`);

        let key = this.generateKey(algo);
        this.contextMap.put('senderKey', key);
        this.contextMap.put('algo', algo);
    }

    @given(/^the key is written to a .pem file$/)
    public async thatTheKeyIsWritten() {
        console.info(`the key is written to a .pem file`);
        let senderKey: AsymmetricKey = this.contextMap.get('senderKey');
        let pemContents = senderKey.exportPrivateKeyInPem();

        return new Promise<string>((resolve, reject) => {

            fs.writeFile('tmp-secret_key.pem', pemContents, {encoding: 'utf-8'}, (err) => {
                if (err) {
                    console.error(`Error writing file: ${err}`);
                    reject(err);
                } else {
                    resolve("done")
                }
            });
        });


    }

    @given(/^the key is read from the .pem file$/)
    public thatTheKeyIsRead() {

        console.info(`the key is read from the .pem file`);

        let algo: string = this.contextMap.get('algo');
        let loadedKeyPair;

        if (algo === 'Ed25519') {
            loadedKeyPair = Keys.Ed25519.loadKeyPairFromPrivateFile('tmp-secret_key.pem');
        } else if (algo === 'Secp256k1') {
            loadedKeyPair = Keys.Secp256K1.loadKeyPairFromPrivateFile('tmp-secret_key.pem');
        }

        this.contextMap.put('loadedKeyPair', loadedKeyPair);
    }

    @given(/the key is the same as the original key$/)
    public thatKeyIsTheSameAsTheOriginal() {
        console.info(`the key is the same as the original key`);
        let loadedKeyPair: Keys.AsymmetricKey = this.contextMap.get('loadedKeyPair');
        let loadedPrivateKeyBytes = Uint8Array.from(loadedKeyPair.privateKey);
        let senderKey: Keys.AsymmetricKey = this.contextMap.get('senderKey');
        let senderPrivateKeyBytes = Uint8Array.from(senderKey.privateKey);
        expect(loadedPrivateKeyBytes).to.be.eql(senderPrivateKeyBytes);
    }

    @given(/^that a "([^"]*)" receiver key is generated$/)
    public thatAReceiverKeyIsGenerated(algo: string) {

        console.info(`Given that a ${algo} receiver key is generated`);
        let key = this.generateKey(algo);
        this.contextMap.put('receiverKey', key);
    }

    @then(/^fund the account from the faucet user with a transfer amount of (\d+) and a payment amount of (\d+)$/)
    public async fundTheAccountFromTheFaucetUserWithATransferAmountOfAndAPaymentAmountOf(transferAmount: number, paymentAmount: number) {

        console.info(`Then fund the account from the faucet user with a transfer amount of ${transferAmount} and a payment amount of ${paymentAmount}`);

        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        expect(faucetKey).to.not.be.undefined;

        this.contextMap.put('faucetKey', faucetKey);

        await this.doDeploy(faucetKey, this.contextMap.get('senderKey'), transferAmount, paymentAmount);
    }

    @then(/^wait for a block added event with a timeout of (\d+) seconds$/, undefined, 300000)
    public async waitForABlockAddedEventWithATimeoutOfSeconds(timeout: number) {

        console.info(`Then wait for a block added event with a timeout of ${timeout} seconds`);

        const result: GetDeployResult = await this.casperClient.nodeClient.waitForDeploy(this.contextMap.get('deploy'), timeout * 1000);

        expect(result).to.not.be.undefined;

        expect(result.execution_results[0].result.Success).to.not.be.undefined;

        const blockHash = result.execution_results[0].block_hash;

        expect(blockHash).to.not.be.undefined;

        this.contextMap.put('blockHash', blockHash);
    }

    @then(/^transfer to the receiver account the transfer amount of (\d+) and the payment amount of (\d+)$/)
    public async transferToTheReceiverAccountTheTransferAmountOfAndThePaymentAmountOf(transferAmount: number, paymentAmount: number) {
        console.info(`Then transfer to the receiver account the transfer amount of ${transferAmount} and the payment amount of ${paymentAmount}`);

        await this.doDeploy(this.contextMap.get('senderKey'), this.contextMap.get('receiverKey'), transferAmount, paymentAmount);
    }

    @then(/^the deploy sender account key contains the "([^"]*)" algo$/)
    public async theReturnedBlockHeaderProposerContainsTheAlgo(algo: string) {
        console.info(`Then the returned block header proposer contains the ${algo} algo`);

        const blockHash: string = this.contextMap.get('blockHash');

        const blockInfo: GetBlockResult = await this.casperClient.nodeClient.getBlockInfo(blockHash);

        expect(blockInfo).to.not.be.undefined;

        const transferHash = Uint8Array.from(Buffer.from((blockInfo.block as any).body.transfer_hashes[0], 'hex'));
        const transfer: Deploy = this.contextMap.get('deploy');

        expect(transferHash).to.be.eql(transfer.hash);

        const algoBytes = transfer.approvals[0].signer.substring(0, 2);

        if ('Ed25519' === algo) {
            expect(algoBytes).to.be.eql('01');
        } else if ('Secp256k1' === algo) {
            expect(algoBytes).to.be.eql('02');
        } else {
            assert.fail(`Invalid algorithm: ${algo}`);
        }
    }

    private async doDeploy(senderKeyPair: AsymmetricKey, receiverKey: AsymmetricKey, amount: number, payment: number) {

        const id = BigNumber.from(Math.round(Math.random()));
        const gasPrice: number = 1;
        const ttl = DeployUtil.dehumanizerTTL('30m');

        const transfer = DeployUtil.ExecutableDeployItem.newTransfer(BigNumber.from(amount), receiverKey.publicKey, undefined, id);
        expect(transfer).to.not.be.undefined;

        const standardPayment = DeployUtil.standardPayment(BigNumber.from(payment));
        expect(standardPayment).to.not.be.undefined;

        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, TestParameters.getInstance().getChainName, gasPrice, ttl);

        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        this.casperClient.signDeploy(deploy, senderKeyPair);

        let deployHash = await this.casperClient.putDeploy(deploy);
        expect(deployHash).to.not.be.null;

        this.contextMap.put("deployResult", deployHash);

        this.contextMap.put('deploy', deploy);
    }

    private generateKey(algo: string): AsymmetricKey {

        let key: Keys.AsymmetricKey;

        switch (algo) {
            case "Ed25519":
                key = Keys.Ed25519.new();
                break;
            case "Secp256k1":
                key = Keys.Secp256K1.new();
                break;
            default:
                assert.fail(`Invalid algorithm: ${algo}`);
        }

        expect(key).to.not.be.undefined;
        expect(key.privateKey).to.not.be.undefined;
        expect(key.publicKey).to.not.be.undefined;

        const msg = Uint8Array.from(Buffer.from('this is the sender', 'utf-8'));
        const signed = key.sign(msg);
        expect(key.verify(signed, msg)).to.be.true;
        return key;
    }
}
