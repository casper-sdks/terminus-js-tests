import {binding, given, then, when} from "cucumber-tsflow";
import {ContextMap} from "../utils/context-map";
import {CasperClient, CLValueBuilder, CLValueParsers, Contracts, DeployUtil, Keys, RuntimeArgs} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import * as fs from "fs";
import {expect} from "chai";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {AsymmetricKey} from "casper-js-sdk/dist/lib/Keys";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";

/**
 * Step definitions for the wasm feature.
 */
@binding()
export class WasmSteps {

    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private contextMap = ContextMap.getInstance();

    @given(/^that a smart contract "([^"]*)" is located in the "([^"]*)" folder$/)
    public thatASmartContractIsInTheFolder(wasmFileName: string, contractsFolder: string) {
        console.info('Give that a smart contract {string} is in the {string} folder');

        const wasmPath = './src/' + contractsFolder + '/' + wasmFileName;
        this.contextMap.put('wasmPath', wasmPath);

        const wasm = fs.readFileSync(wasmPath, null);
        expect(wasm).to.not.be.undefined;
    }

    @then(/^the wasm is loaded as from the file system$/)
    public async whenTheWasmIsLoadedAsFromTheFileSystem() {

        console.info('Then when the wasm is loaded as from the file system');

        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        this.contextMap.put('faucetKey', faucetKey);

        const wasmPath: string = this.contextMap.get('wasmPath');
        const wasm = new Uint8Array(fs.readFileSync(wasmPath, null).buffer);
        expect(wasm.length).to.be.eql(189336);

        const tokenName = 'Acme Token';
        const tokenSymbol = 'ACME';
        const tokenDecimals = 11;
        const chainName = 'casper-net-1'
        const tokenTotalSupply = '500000000000';

        const args = RuntimeArgs.fromMap({
            token_decimals: CLValueBuilder.u8(tokenDecimals),
            token_name: CLValueBuilder.string(tokenName),
            token_symbol: CLValueBuilder.string(tokenSymbol),
            token_total_supply: CLValueBuilder.u256(tokenTotalSupply)
        });

        const erc20 = new Contracts.Contract(this.casperClient);

        const deploy = erc20.install(wasm,
            args,
            '200000000000',
            faucetKey.publicKey,
            chainName,
            [faucetKey]
        );

        const deployHash = await this.casperClient.putDeploy(deploy);

        this.contextMap.put('deployHash', deployHash);
        this.contextMap.put('deploy', deploy);

        expect(this.contextMap.get('deployHash')).to.not.be.undefined;
    }

    @then(/he wasm has been successfully deployed$/, undefined, 300000)
    public async theWasmHasBeenSuccessfullyDeployed() {

        console.info("the wasm has been successfully deployed");

        const deployResult = await this.casperClient.nodeClient.waitForDeploy(this.contextMap.get('deploy'), 300000);

        expect(deployResult).to.not.be.undefined;
        const execution_results = (<any>deployResult).execution_results;
        expect(execution_results).to.have.length.gt(0);
        expect(execution_results[0].result.Success).to.not.be.undefined;
    }

    @then(/^the account named keys contain the "([^"]*)" name$/, undefined, 30000)
    public async theAccountNamedKeysContainThe(contractName: string) {

        console.info(`Then the account named keys contain the ${contractName}`);

        const stateRootHash = await this.casperClient.nodeClient.getStateRootHash();
        expect(stateRootHash).to.not.be.undefined;
        this.contextMap.put('stateRootHash', stateRootHash);

        const faucetKey: AsymmetricKey = this.contextMap.get('faucetKey');
        const accountHash = 'account-hash-' + faucetKey.publicKey.toAccountRawHashStr();

        const stateItem = await this.casperClient.nodeClient.getBlockState(
            stateRootHash,
            accountHash,
            []
        );

        expect(stateItem).is.not.null;

        expect((stateItem as any).Account.namedKeys[0].name).to.be.eql(contractName.toUpperCase())
        expect((stateItem as any).Account.namedKeys[0].key).to.contain('hash-');

        this.contextMap.put('contractHash', (stateItem as any).Account.namedKeys[0].key);
    }

    @then(/^the contract data "([^"]*)" is a "([^"]*)" with a value of "([^"]*)" and bytes of "([^"]*)"$/)
    public async theContractDataIsAWithAValueOf(path: string, typeName: string, value: string, hexBytes: string) {

        console.info(`Then the contract data "${path}" is a "${typeName}" with a value of "${value}" and bytes of "${hexBytes}"`);

        const stateRootHash: string = this.contextMap.get('stateRootHash');
        const contractHash: string = this.contextMap.get('contractHash');

        const stateItem = await this.casperClient.nodeClient.getBlockState(
            stateRootHash,
            contractHash,
            [path]
        );

        expect(stateItem).to.not.be.null;

        const clVal: CLValue = (stateItem as any).CLValue;

        expect(clVal.data.toString()).to.be.eql(value);
        expect(clVal.clType().linksTo).to.be.eql(typeName);
        // NOTE JS SDK does not provide bytes in the CL value, so we have to convert manually
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        const actualBytes = CLValueParsers.toBytes(clVal);
        expect(actualBytes.val).to.be.eql(expectedBytes);
    }

    @then(/^the contract dictionary item "([^"]*)" is a "([^"]*)" with a value of "([^"]*)" and bytes of "([^"]*)"$/)
    public async theContractDictionaryItemIsAWithAValueOfAndBytesOf(dictionary: string,
                                                                    typeName: string,
                                                                    value: string,
                                                                    hexBytes: string) {

        const stateRootHash: string = this.contextMap.get('stateRootHash');
        const contractHash: string = this.contextMap.get('contractHash');
        const faucetKey: AsymmetricKey = this.contextMap.get('faucetKey');

        const balanceKey = Buffer.from(
            CLValueParsers.toBytes(CLValueBuilder.key(faucetKey.publicKey)).unwrap()
        ).toString('base64');

        const storedValue = await this.casperClient.nodeClient.getDictionaryItemByName(
            stateRootHash,
            contractHash,
            dictionary,
            balanceKey
        );

        expect(storedValue).to.not.be.undefined;

        const clValue: CLValue = (storedValue as any).CLValue;

        expect(clValue.data.toString()).to.be(value);
        expect(clValue.clType().linksTo).to.be.eql(typeName);
        // NOTE JS SDK does not provide bytes in the CL value, so we have to convert manually
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        const actualBytes = CLValueParsers.toBytes(clValue);
        expect(actualBytes.val).to.be.eql(expectedBytes);
    }


    @when(/^the contract entry point is invoked with a transfer amount of "([^"]*)"$/)
    public async theContractEntryPointIsInvokedWithATransferAmountOf(transferAmount: string) {

        console.info(`When the contract entry point is invoked with a transfer amount of ${transferAmount}`);

        const recipient = Keys.Ed25519.new().publicKey;

        const faucetKey: AsymmetricKey = this.contextMap.get('faucetKey');

        const contractHash = (this.contextMap.get('contractHash') as string).slice(5);
        const ttl = DeployUtil.dehumanizerTTL("30m");

        const transferArgs = RuntimeArgs.fromMap({
            recipient: CLValueBuilder.byteArray(recipient.toAccountHash()),
            amount: CLValueBuilder.u256(transferAmount)
        });

        const deploy = DeployUtil.makeDeploy(
            new DeployUtil.DeployParams(faucetKey.publicKey, "casper-net-1", 1, ttl),

            DeployUtil.ExecutableDeployItem.newStoredContractByHash(
                Uint8Array.from(Buffer.from(contractHash, 'hex')),
                'transfer',
                transferArgs
            ),
            DeployUtil.standardPayment("2500000000")
        );

        const signedDeploy = deploy.sign([faucetKey]);

        const deployHash = await this.casperClient.putDeploy(signedDeploy);
        expect(deployHash).to.not.be.undefined;

        this.contextMap.put('deploy', signedDeploy);
    }

    @then(/^the contract invocation deploy is successful$/, undefined, 300000)
    public async theContractInvocationDeployIsSuccessful() {

        console.info(`Then the contract invocation deploy is successful`);

        const deploy: Deploy = this.contextMap.get('deploy');
        const deployResult = await this.casperClient.nodeClient.waitForDeploy(deploy, 300000);
        expect(deployResult).to.not.be.undefined;
        const execution_results = (<any>deployResult).execution_results;
        expect(execution_results).to.have.length.gt(0);
        expect(execution_results[0].result.Success).to.not.be.undefined;
    }
}
