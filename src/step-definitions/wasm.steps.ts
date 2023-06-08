import {binding, given, then} from "cucumber-tsflow";
import {ContextMap} from "../utils/context-map";
import {CasperClient, CLValueBuilder, Keys, RuntimeArgs, Contracts} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import * as fs from "fs";
import {expect} from "chai";

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

    @then(/^when the wasm is loaded as from the file system$/)
    public async whenTheWasmIsLoadedAsFromTheFileSystem() {

        console.info('Then when the wasm is loaded as from the file system');

        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const wasmPath: string = this.contextMap.get('wasmPath');
        const wasm = new Uint8Array(fs.readFileSync(wasmPath, null).buffer);
        expect(wasm.length).to.be.eql(189336);

        const tokenName = 'Acme Token';
        const tokenSymbol = 'ACME';
        const tokenDecimals = 8;
        const chainName = 'casper-net-1'
        const tokenTotalSupply = 500_000_000_000;

        const args = RuntimeArgs.fromMap({
            name: CLValueBuilder.string(tokenName),
            symbol: CLValueBuilder.string(tokenSymbol),
            decimals: CLValueBuilder.u8(tokenDecimals),
            total_supply: CLValueBuilder.u256(tokenTotalSupply)
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
       });

       expect(this.contextMap.get('deployHash')).to.not.be.undefined;
    }
}
