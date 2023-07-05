import {binding, given, then, when} from "cucumber-tsflow";
import {ContextMap} from "../utils/context-map";
import {
    CasperClient,
    CLValueBuilder,
    CLValueParsers,
    Contracts,
    DeployUtil,
    Keys,
    RuntimeArgs,
    StoredValue
} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import * as fs from "fs";
import {expect} from "chai";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {GetDeployResult} from "casper-js-sdk/dist/services";
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

        await this.casperClient.putDeploy(deploy).then(deployHash => {
            this.contextMap.put('deployHash', deployHash);
            this.contextMap.put('deploy', deploy);
        }).catch(e => {
            console.log(e);
        });

        expect(this.contextMap.get('deployHash')).to.not.be.undefined;
    }

    @then(/he wasm has been successfully deployed$/, undefined, 300000)
    public async theWasmHasBeenSuccessfullyDeployed() {

        console.info("the wasm has been successfully deployed");

        const deploy: Deploy = this.contextMap.get('deploy');
        let deployResult: GetDeployResult | null = null;
        await this.casperClient.nodeClient.waitForDeploy(deploy, 300000).then(result => {
            deployResult = result;
        });

        expect(deployResult).to.not.be.undefined;
        const execution_results = (<any>deployResult).execution_results;
        expect(execution_results).to.have.length.gt(0);
        expect(execution_results[0].result.Success).to.not.be.undefined;
    }

    @then(/^the account named keys contain the "([^"]*)" name$/, undefined, 30000)
    public async theAccountNamedKeysContainThe(contractName: string) {

        console.info(`Then the account named keys contain the ${contractName}`);

        await this.casperClient.nodeClient.getStateRootHash().then(hash => {
            this.contextMap.put('stateRootHash', hash);
        });

        const stateRootHash: string = this.contextMap.get('stateRootHash');
        expect(stateRootHash).to.not.be.undefined;

        const faucetKey: AsymmetricKey = this.contextMap.get('faucetKey');
        const accountHash = 'account-hash-' + faucetKey.publicKey.toAccountRawHashStr();

        let stateItem: StoredValue | null = null;

        await this.casperClient.nodeClient.getBlockState(
            stateRootHash,
            accountHash,
            []
        ).then(storedValue => {
            stateItem = storedValue;
        });

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

        let stateItem: StoredValue | null = null;

        await this.casperClient.nodeClient.getBlockState(
            stateRootHash,
            contractHash,
            [path]
        ).then(storedValue => {
            stateItem = storedValue;
        });

        expect(stateItem).to.not.be.null;

        const clVal: CLValue = (stateItem as any).CLValue;

        expect(clVal.data.toString()).to.be.eql(value);
        expect(clVal.clType().linksTo).to.be.eql(typeName);
        // NOTE JS SDK does not provide bytes in the CL value so we have to convert manually
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        const actualBytes = CLValueParsers.toBytes(clVal);
        expect(actualBytes.val).to.be.eql(expectedBytes);
    }

    @then(/^the contract dictionary item "([^"]*)" is a "([^"]*)" with a value of "([^"]*)" and bytes of "([^"]*)"$/)
    public theContractDictionaryItemIsAWithAValueOfAndBytesOf(dictionary: string, typeName: string, value: string, hexBytes: string) {

        /*

    final String stateRootHash = this.contextMap.get("stateRootHash");
    final String contractHash = this.contextMap.get("contractHash");
    final Ed25519PrivateKey faucetPrivateKey = this.contextMap.get("faucetPrivateKey");

    final CLValuePublicKey clValuePublicKey = new CLValuePublicKey(PublicKey.fromAbstractPublicKey(faucetPrivateKey.derivePublicKey()));
    final byte[] decode = Hex.decode(clValuePublicKey.getBytes());
    final byte[] encode = Base64.getEncoder().encode(decode);
    final String balanceKey = Hex.encode(encode);

    final ContractNamedKeyDictionaryIdentifier identifier = ContractNamedKeyDictionaryIdentifier
        .builder()
        .contractNamedKey(ContractNamedKey.builder().dictionaryItemKey(contractHash).dictionaryName(dictionary).key(balanceKey).build())
        .build();
    final DictionaryData stateDictionaryItem = this.casperService.getStateDictionaryItem(
        stateRootHash,
        identifier
    );

    final AbstractCLValue clValue = (AbstractCLValue) stateDictionaryItem.getStoredValue().getValue();
    assertThat(clValue.getClType().getTypeName(), is(typeName));

    final Object expectedValue = convertToCLTypeValue(typeName, value);
    assertThat(clValue.getValue(), is(expectedValue));

    assertThat(clValue.getBytes(), is(hexBytes));*/
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

        let deploy_hash: any = null;
        await this.casperClient.putDeploy(signedDeploy).then(hash => {
            deploy_hash = hash;
        })

        expect(deploy_hash).to.not.be.undefined;

        this.contextMap.put('deploy', signedDeploy)
    }

    @then(/^the contract invocation deploy is successful$/, undefined, 300000)
    public async theContractInvocationDeployIsSuccessful() {

        console.info(`Then the contract invocation deploy is successful`);

        const deploy: Deploy = this.contextMap.get('deploy');
        let deployResult: GetDeployResult | null = null;

        await this.casperClient.nodeClient.waitForDeploy(deploy, 300000).then(result => {
            deployResult = result;
        });

        expect(deployResult).to.not.be.undefined;
        const execution_results = (<any>deployResult).execution_results;
        expect(execution_results).to.have.length.gt(0);
        expect(execution_results[0].result.Success).to.not.be.undefined;
    }
}
