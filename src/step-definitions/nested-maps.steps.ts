import {binding, given, then, when} from "cucumber-tsflow";
import {CasperClient, CLMap, CLTypeTag, CLValueParsers, JsonDeploy, NamedArg} from "casper-js-sdk";
import {CLValueFactory} from "../utils/cl-value.factory";
import {TestParameters} from "../utils/test-parameters";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";
import {expect} from "chai";
import {DeployUtils} from "../utils/deploy-utils";

/**
 * The steps for the nested-maps.feature
 */
@binding()
export class NestedMapsSteps {

    private cLValueFactory = new CLValueFactory();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private deploy: Deploy = {} as Deploy;
    private deployHash: string = '';
    private clMap: CLMap<CLValue, CLValue> = {} as CLMap<CLValue, CLValue>;
    private jsonDeploy: JsonDeploy = {} as JsonDeploy

    @given(/^a map is created \{"([^"]*)": (\d+)}$/)
    public aMapIsCreated(key: string, value: number) {
        this.clMap = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.String, key), this.cLValueFactory.createValue(CLTypeTag.U32, '' + value)]
        ]);
    }

    @then(/^the map's key type is "([^"]*)" and the maps value type is "([^"]*)"$/)
    public theMapsKeyTypeIsAndTheMapsValueTypeIs(keyType: string, valueType: string) {
        expect(this.clMap.data[0][0].clType().toString()).to.be.eql(keyType);
        expect(this.clMap.data[0][1].clType().toString()).to.be.eql(valueType);
    }

    @then(/^the map's bytes are "([^"]*)"$/)
    public theMapSBytesAre(hexBytes: string) {
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        const actualBytes = CLValueParsers.toBytes(this.clMap).val;
        expect(actualBytes).to.be.eql(expectedBytes);
    }

    @given(/^a nested map is created \{"([^"]*)": \{"([^"]*)": (\d+)}, "([^"]*)": \{"([^"]*)", (\d+)}}$/)
    public aNestedMapIsCreated(key0: string, key1: string, value1: number, key2: string, key3: string, value3: number) {
        const innerMap1 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.String, key1), this.cLValueFactory.createValue(CLTypeTag.U32, '' + value1)]
        ]);

        const innerMap2 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.String, key3), this.cLValueFactory.createValue(CLTypeTag.U32, '' + value3)]
        ]);

        this.clMap = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.String, key0), innerMap1],
            [this.cLValueFactory.createValue(CLTypeTag.String, key2), innerMap2]
        ]);
    }

    @given(/^that the nested map is deployed in a transfer$/)
    public async thatTheNestedTuplesAreDeployedInATransfer() {
        this.deploy = DeployUtils.buildStandardTransferDeploy(this.casperClient, [new NamedArg("map", this.clMap)]);
        this.deployHash = await this.casperClient.putDeploy(this.deploy);
    }

    @then(/^the transfer containing the nested map is successfully executed$/)
    public theTransferIsSuccessful() {
        expect(this.deployHash).to.not.be.null;
    }

    @given(/^a nested map is created \{(\d+): \{(\d+): \{(\d+): "([^"]*)"}, (\d+): \{(\d+): "([^"]*)"}}, (\d+): \{(\d+): \{(\d+): "([^"]*)"}, (\d+): \{(\d+): "([^"]*)"}}}$/)
    public anotherNestedMapIsCreated(key1: number,
                                     key11: number,
                                     key111: number,
                                     value111: string,
                                     key12: number,
                                     key121: number,
                                     value121: string,
                                     key2: number,
                                     key21: number,
                                     key211: number,
                                     value211: string,
                                     key22: number,
                                     key221: number,
                                     value221: string) {
        const innerMap111 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key111), this.cLValueFactory.createValue(CLTypeTag.String, value111)]
        ]);

        const innerMap121 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key121), this.cLValueFactory.createValue(CLTypeTag.String, value121)]
        ]);

        const innerMap211 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key211), this.cLValueFactory.createValue(CLTypeTag.String, value211)]
        ]);

        const innerMap221 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key221), this.cLValueFactory.createValue(CLTypeTag.String, value221)]
        ]);

        const innerMap1 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key11), innerMap111],
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key12), innerMap121]
        ]);

        const innerMap2 = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key21), innerMap211],
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key22), innerMap221]
        ]);

        this.clMap = new CLMap([
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key1), innerMap1],
            [this.cLValueFactory.createValue(CLTypeTag.U256, '' + key2), innerMap2]
        ]);
    }

    @when(/^the map is read from the deploy$/)
    public async theMapIsReadFromTheDeploy() {
       await this.casperClient.getDeploy(this.deployHash).then(deployAndResults => {
            this.jsonDeploy = deployAndResults[1].deploy;
            const arg = DeployUtils.getNamedArgument(this.jsonDeploy, "map");
            this.clMap = arg[1];
        })
    }

    @then(/^the map's key is "([^"]*)" and value is "([^"]*)"$/)
    public theMapsKeyIsAndValueIs(strKey: string, strValue: string) {
        const val = this.clMap.get(this.cLValueFactory.createValue(CLTypeTag.String, strKey));
        expect(val).to.not.be.null;
        expect(val?.value().toString()).to.be.eql(strValue)
    }

    @then(/^the 1st nested map's key is "([^"]*)" and value is "([^"]*)"$/)
    public theStNestedMapSKeyIsAndValueIs(strKey: string, strValue: string) {
        const entry = this.clMap.data[0];
        const val = (entry[1] as CLMap<CLValue, CLValue>).get(this.cLValueFactory.createValue(CLTypeTag.String, strKey));
        expect(val).to.not.be.null;
        expect(val?.value().toString()).to.be.eql(strValue)
    }
}
