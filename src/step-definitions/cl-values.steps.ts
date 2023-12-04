import {ContextMap} from "../utils/context-map";
import {CasperClient, CLTypeTag, CLValueParsers, JsonDeploy, NamedArg} from "casper-js-sdk";
import {CLValueFactory} from "../utils/cl-value.factory";
import {ClTypeUtils} from "../utils/cl-type-utils";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";
import {assert, expect} from "chai";
import {binding, given, then, when} from "cucumber-tsflow";
import {TestParameters} from "../utils/test-parameters";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {GetDeployResult} from "casper-js-sdk/dist/services";
import {DeployUtils} from "../utils/deploy-utils";

/**
 * The steps definitions for the cl_values.feature
 */
@binding()
export class ClValuesSteps {

    private contextMap = ContextMap.getInstance();
    private cLValueFactory = new CLValueFactory();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that a CL value of type "([^"]*)" has a value of "([^"]*)"$/)
    public thatACLValueOfTypeHasAValueOf(typeName: string, strValue: string) {

        console.info("Given that a CL value of type {} has a value of {}", typeName, strValue);

        const value = this.cLValueFactory.createValue(ClTypeUtils.getCLType(typeName), strValue);

        this.addValueToContext(value);
    }

    @then(/^it's bytes will be "([^"]*)"$/)
    public itSBytesWillBe(hexBytes: string) {
        const clValue: CLValue = this.contextMap.get("clValue");

        if (clValue.clType().tag == CLTypeTag.Key) {
            hexBytes = '01' + hexBytes;
        }
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        // In JS libs
        const actualBytes = CLValueParsers.toBytes(clValue).val;
        expect(actualBytes).to.be.eql(expectedBytes);
    }

    @when(/^the values are added as arguments to a deploy$/)
    public theValuesAreAddedAsArgumentsToADeploy() {

        const clValues: Array<NamedArg> = this.contextMap.get("clValues");
        const deploy = DeployUtils.buildStandardTransferDeploy(this.casperClient, clValues)

        this.contextMap.put('putDeploy', deploy);
        expect(this.contextMap.get('deployResult')).to.not.be.null;
    }

    @then(/^the deploy body hash is "([^"]*)"$/)
    public theDeployBodyHashIs(bodyHash: string) {

        const deploy: Deploy = this.contextMap.get("putDeploy");
        expect(deploy.header.bodyHash).to.be.eql(bodyHash);
    }

    @when(/^the deploy is put on chain$/)
    public async theDeployIsPutOnChain() {

        const deploy: Deploy = this.contextMap.get("putDeploy");
        this.contextMap.put("deployResult", await this.casperClient.putDeploy(deploy));
    }

    @then(/^the deploy has successfully executed$/, undefined, 300000)
    public async theDeployHasSuccessfullyExecuted() {

        const deployResult = await this.casperClient.nodeClient.waitForDeploy(this.contextMap.get('putDeploy'), 300000);
        expect(deployResult).to.not.be.undefined;
        const execution_results = (<any>deployResult).execution_results;
        expect(execution_results).to.have.length.gt(0);
        expect(execution_results[0].result.Success).to.not.be.undefined;
    }

    @when(/^the deploy is obtained from the node$/)
    public async theDeployIsObtainedFromTheNode() {

        const deploy = await this.casperClient.getDeploy(this.contextMap.get("deployResult"));
        expect(deploy).to.not.be.undefined;
        this.contextMap.put('getDeploy', deploy);
    }

    @then(/^the deploys NamedArgument "([^"]*)" has a value of "([^"]*)" and bytes of "([^"]*)"$/)
    public theDeploysNamedArgumentHasAValueOfAndBytesOf(name: string, strValue: string, hexBytes: string) {
        const deployResult: [Deploy, GetDeployResult] = this.contextMap.get('getDeploy');
        const deploy: JsonDeploy = deployResult[1].deploy;
        const arg = DeployUtils.getNamedArgument(deploy, name);
        expect(arg[1].bytes).to.be.eql(hexBytes);

        const expectedValue: any = ClTypeUtils.convertToCLTypeValue(name, strValue)
        expect(arg[1].parsed).to.be.eql(expectedValue);

        if (arg[1].cl_type.ByteArray) {
            expect(arg[1].cl_type.ByteArray).to.be.eql(hexBytes.length / 2);
        } else {
            expect(arg[1].cl_type).to.be.eql(name);
        }
    }


    @given(/^that the CL complex value of type "([^"]*)" with an internal types of "([^"]*)" values of "([^"]*)"$/)
    public thatTheCLComplexValueOfTypeWithAnInternalTypesOfValuesOf(type: string, innerTypes: string, innerValues: string) {

        const types = this.getInnerClTypeData(innerTypes);
        const values = innerValues.split(",");
        const complexValue = this.cLValueFactory.createComplexValue(ClTypeUtils.getCLType(type), types, values);
        this.addValueToContext(complexValue);
    }


    @then(/^the deploys NamedArgument Complex value "([^"]*)" has internal types of "([^"]*)" and values of "([^"]*)" and bytes of "([^"]*)"$/)
    public theDeploysNamedArgumentComplexValueHasInternalValuesOfAndBytesOf(name: string, types: string, values: string, hexBytes: string) {

        const deployResult: [Deploy, GetDeployResult] = this.contextMap.get('getDeploy');
        const deploy: JsonDeploy = deployResult[1].deploy;
        const arg = DeployUtils.getNamedArgument(deploy, name);

        expect(arg).to.not.be.undefined;
        expect(arg[1].bytes).to.be.eql(hexBytes);
        if (!ClTypeUtils.isComplexType(name)) {
            expect(arg[1].cl_type).to.be.eql(name);
        } else {
            expect(arg[1].cl_type[name]).to.not.be.undefined;
        }

        switch (ClTypeUtils.getCLType(name)) {
            case CLTypeTag.List:
                this.assertList(arg[1], types, values);
                break;
            case CLTypeTag.Map:
                this.assertMap(arg[1], types, values);
                break;
            case CLTypeTag.Option:
                this.assertOption(arg[1], types, values);
                break;
            case CLTypeTag.Tuple1:
                this.assertTupleOne(arg[1], types, values);
                break;
            case CLTypeTag.Tuple2:
                this.assertTupleTwo(arg[1], types, values);
                break;
            case CLTypeTag.Tuple3:
                this.assertTupleThree(arg[1], types, values);
                break;
            default:
                assert.fail(`Invalid typeName: ${name}`);
        }
    }

    private assertList(clValue: any, types: string, values: string) {

        const complexValue = this.cLValueFactory.createComplexValue(CLTypeTag.List, this.getInnerClTypeData(types), values.split(','));

        expect(clValue.parsed.length).to.be.eql(complexValue.value().length);

        for (let i = 0; i < clValue.parsed.length; i++) {
            expect(clValue.parsed[i]).to.be.eql(complexValue.value()[i].value());
        }
    }

    private assertMap(clValue: any, types: string, values: string) {

        const complexValue = this.cLValueFactory.createComplexValue(CLTypeTag.Map, this.getInnerClTypeData(types), values.split(','));

        expect(clValue.parsed.length).to.be.eql(complexValue.value().length);

        for (let i = 0; i < clValue.parsed.length; i++) {
            expect(clValue.parsed[i].value).to.be.eql(complexValue.value()[i][1].value().toString());
        }
    }

    private assertTupleThree(clValue: any, types: string, values: string) {
        this.assertTuple(clValue, types, values, CLTypeTag.Tuple3);
    }

    private assertTupleTwo(clValue: any, types: string, values: string) {
        this.assertTuple(clValue, types, values, CLTypeTag.Tuple2);
    }

    private assertTupleOne(clValue: any, types: string, values: string) {
        this.assertTuple(clValue, types, values, CLTypeTag.Tuple1);
    }

    private assertTuple(clValue: any, types: string, values: string, tag: CLTypeTag) {

        let complexValue = this.cLValueFactory.createComplexValue(tag, this.getInnerClTypeData(types), values.split(','));

        let len = 1;
        if (tag == CLTypeTag.Tuple2) {
            len = 2;
        } else if (tag == CLTypeTag.Tuple3) {
            len = 3;
        }

        for (let i = 0; i < len; i++) {
            expect(clValue.parsed[i].toString()).to.be.eql(complexValue.value()[i].value().toString());
        }
    }

    private assertOption(clValue: any, types: string, values: string) {

        const innerValue = this.cLValueFactory.createValue(ClTypeUtils.getCLType(types), values);

        expect(innerValue).to.not.be.undefined;
        expect(clValue.parsed).to.be.eql(innerValue.value());
        expect(clValue.cl_type.Option).to.not.be.undefined;
        expect(clValue.cl_type.Option).to.be.eql(types);
    }

    private addValueToContext(value: CLValue) {

        this.contextMap.put("clValue", value);

        let clValues: Array<NamedArg> = this.contextMap.get("clValues");
        if (!clValues) {
            clValues = new Array<NamedArg>();
            this.contextMap.put("clValues", clValues);
        }
        const name = CLTypeTag[value.clType().tag];
        clValues.push(new NamedArg(name, value));
    }

    private getInnerClTypeData(innerTypes: string): CLTypeTag[] {

        let types = new Array<CLTypeTag>();

        innerTypes.split(',').forEach(strType => {
            types.push(ClTypeUtils.getCLType(strType.trim()));
        })

        return types;
    }

}
