import {binding, given, then, when} from "cucumber-tsflow";
import {CLValueFactory} from "../utils/cl-value.factory";
import {CasperClient, CLList, CLValueParsers, NamedArg} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ClTypeUtils} from "../utils/cl-type-utils";
import {expect} from "chai";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";
import {DeployUtils} from "../utils/deploy-utils";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";

/**
 * Step definitions for the nested-list.feature
 */
@binding()
export class NestedListSteps {

    private cLValueFactory = new CLValueFactory();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private clList: CLList<any> = {} as CLList<any>
    private deploy: Deploy = {} as Deploy;
    private deployHash: string = '';

    @given(/^a list is created with "([^"]*)" values of \("([^"]*)", "([^"]*)", "([^"]*)"\)$/)
    aListIsCreatedWithValuesOf(type: string, val1: string, val2: string, val3: string) {
        let values = [];
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType(type), val1));
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType(type), val2));
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType(type), val3));
        this.clList = new CLList(values);
    }

    @given(/^a list is created with U(\d+) values of \((\d+), (\d+), (\d+)\)$/)
    aListIsCreatedWithUValuesOf(numberLen: number, val1: number, val2: number, val3: number) {
        let values = [];
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val1));
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val2));
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val3));
        this.clList = new CLList(values);
    }

    @given(/^a list is created with I(\d+) values of \((\d+), (\d+), (\d+)\)$/)
    aListIsCreatedWithIValuesOf(numberLen: number, val1: number, val2: number, val3: number) {
        let values = [];
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("I" + numberLen), '' + val1));
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("I" + numberLen), '' + val2));
        values.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("I" + numberLen), '' + val3));
        this.clList = new CLList(values);
    }


    @given(/^a nested list is created with U(\d+) values of \(\((\d+), (\d+), (\d+)\),\((\d+), (\d+), (\d+)\)\)$/)
    theNestedListSItemIsCratedWithValueOf(numberLen: number, val1: number, val2: number, val3: number, val4: number, val5: number, val6: number) {
        let innerValues1 = [];
        innerValues1.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val1));
        innerValues1.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val2));
        innerValues1.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val3));

        let innerValues2 = [];
        innerValues2.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val4));
        innerValues2.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val5));
        innerValues2.push(this.cLValueFactory.createValue(ClTypeUtils.getCLType("U" + numberLen), '' + val6));

        let values = [];
        values.push(new CLList(innerValues1));
        values.push(new CLList(innerValues2));
        this.clList = new CLList(values);
    }

    @then(/^the list's bytes are "([^"]*)"$/)
    theListSBytesAre(hexBytes: string) {
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        // In JS libs
        const actualBytes = CLValueParsers.toBytes(this.clList).val;
        expect(actualBytes).to.be.eql(expectedBytes);
    }

    @then(/^the list's length is (\d+)$/)
    theListSLengthIs(length: number) {
        expect(this.clList.size()).to.be.eql(length);
    }

    @then(/^the list's "([^"]*)" item is a CLValue with "([^"]*)" value of "([^"]*)"$/)
    theListSItemIsACLValueWithValueOf(nth: string, valueType: string, value: string) {
        let clValue = this.clList.get(this.getIndex(nth)) as CLValue;
        expect(clValue.clType().toString()).to.be.eql(valueType);
        expect(clValue.value().toString()).to.be.eql(value);
    }

    @then(/^the list's "([^"]*)" item is a CLValue with I(\d+) value of (\d+)$/)
    theListSItemIsACLValueWithIValueOf(nth: string, numType: number, value: number) {
        let clValue = this.clList.get(this.getIndex(nth)) as CLValue;
        expect(clValue.clType().toString()).to.be.eql("I" + numType);
        expect(clValue.value().toNumber()).to.be.eql(value);
    }

    @then(/^the list's "([^"]*)" item is a CLValue with U(\d+) value of (\d+)$/)
    theListSItemIsACLValueWithUValueOf(nth: string, numType: number, value: number) {
        let clValue = this.clList.get(this.getIndex(nth)) as CLValue;
        expect(clValue.clType().toString()).to.be.eql("U" + numType);
        expect(clValue.value().toNumber()).to.be.eql(value);
    }

    @given(/^that the list is deployed in a transfer$/)
    async thatTheListIsDeployedInATransfer() {
        this.deploy = DeployUtils.buildStandardTransferDeploy(this.casperClient, [new NamedArg("list", this.clList)]);
        this.deployHash = await this.casperClient.putDeploy(this.deploy);
    }

    @given(/^the transfer containing the list is successfully executed$/)
    theTransferContainingTheListIsSuccessfullyExecuted() {
        expect(this.deployHash).to.not.be.null;
    }

    @when(/^the list is read from the deploy$/)
    async theListIsReadFromTheDeploy() {
        await this.casperClient.getDeploy(this.deployHash).then(deployAndResults => {
            this.deploy = deployAndResults[0];
        });
    }

    @then(/^the "([^"]*)" nested list's "([^"]*)" item is a CLValue with U(\d+) value of (\d+)$/)
    theNestedListSItemIsACLValueWithValueOf(nth: string, nestedNth: string, valueType: string, value: string) {
        let clValue = this.clList.get(this.getIndex(nth)) as CLList<any>;
        let nestedClValue = clValue.get(this.getIndex(nestedNth)) as CLValue;
        expect(nestedClValue.clType().toString()).to.be.eql("U" + valueType);
        expect(nestedClValue.value().toNumber()).to.be.eql(value);
    }

    private getIndex(nth: string): number {
        return (+nth.substring(0, 1)) - 1;
    }
}
