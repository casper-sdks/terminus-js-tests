import {binding, given, then, when} from "cucumber-tsflow";
import {CLValueFactory} from "../utils/cl-value.factory";
import {
    CasperClient,
    CLList,
    CLMap,
    CLOption,
    CLString,
    CLTuple2,
    CLTypeTag,
    CLU256,
    CLValueParsers,
    NamedArg
} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {expect} from "chai";
import {Some} from "ts-results";
import {DeployUtils} from "../utils/deploy-utils";
import {ClTypeUtils} from "../utils/cl-type-utils";

/**
 * The steps for the nested-options.feature.
 */
@binding()
export class NestedOptionsSteps {

    private cLValueFactory = new CLValueFactory();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private clValueOption: CLOption<CLValue> = {} as CLOption<CLValue>;
    private deploy: Deploy = {} as Deploy;
    private deployHash: string = '';

    @given(/^that a nested Option has an inner type of Option with a type of String and a value of "([^"]*)"$/)
    public aNestedOptionHasanInnerTypeofOptionWithATypeofStringAndaValueOf(value: string) {
        const innerOption = this.cLValueFactory.createComplexValue(CLTypeTag.Option, [CLTypeTag.String], [value]) as CLOption<CLValue>;
        this.clValueOption = new CLOption(Some(innerOption));
    }

    @then(/^the inner type is Option with a type of String and a value of "([^"]*)"$/)
    public theInnerTypeIsOptionWithATypeOfStringAndAValueOf(value: string) {
        expect(this.clValueOption.isSome()).is.true;
        const inner: any = this.clValueOption.data;
        expect(inner.val.data.val.data).to.be.eql(value);
    }

    @then(/^the bytes are "([^"]*)"$/)
    public theBytesAre(hexBytes: string) {
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        const actualBytes = CLValueParsers.toBytes(this.clValueOption).val;
        expect(actualBytes).to.be.eql(expectedBytes);
    }

    @given(/^that the nested Option is deployed in a transfer$/)
    public async thatTheNestedOptionIsDeployedInATransfer() {
        this.deploy = DeployUtils.buildStandardTransferDeploy(this.casperClient, [
            new NamedArg("nested-option", this.clValueOption)
        ]);
        this.deployHash = await this.casperClient.putDeploy(this.deploy);
        // Clear out the value for next steps
        this.clValueOption = {} as CLOption<CLValue>;
    }

    @given(/^the transfer containing the nested Option is successfully executed$/)
    public theTransferContainingTheNestedOptionIsSuccessfullyExecuted() {
        expect(this.deployHash).to.not.be.null;
    }

    @when(/^the Option is read from the deploy$/)
    async theOptionIsReadFromTheDeploy() {
        await this.casperClient.getDeploy(this.deployHash).then(deployAndResults => {
            this.deploy = deployAndResults[0];
            this.clValueOption = this.deploy.session.getArgByName("nested-option") as CLOption<CLValue>;
        });
    }

    @given(/^that a nested Option has an inner type of List with a type of U256 and a value of \((\d+), (\d+), (\d+)\)$/)
    public thatANestedOptionHasAnInnerTypeOfListWithATypeOfUAndAValueOf(val1: number, val2: number, val3: number) {
        const innerList: CLList<CLU256> = this.cLValueFactory.createComplexValue(
            CLTypeTag.List,
            [CLTypeTag.U256, CLTypeTag.U256, CLTypeTag.U256],
            [val1.toString(), val2.toString(), val3.toString()]
        ) as CLList<CLU256>;

        this.clValueOption = new CLOption(Some(innerList));
    }

    @then(/^the nested list's length is (\d+)$/)
    public theListSLengthIs(length: number) {
        expect(this.clValueOption.isSome()).is.true;
        const inner: any = this.clValueOption.data;
        expect(inner.val.data.length).to.be.eql(length);
    }

    @then(/^the nested list's "([^"]*)" item is a CLValue with U(\d+) value of (\d+)$/)
    public theNestedListSItemIsACLValueWithValueOf(nth: string, numberLen: number, value: number) {
        const inner: any = this.clValueOption.data;
        const list = inner.val.data;
        expect(list[this.getIndex(nth)].value().toNumber()).to.be.eql(value);
    }

    @given(/^that a nested Option has an inner type of Tuple2 with a type of "([^"]*)" values of \("([^"]*)", (\d+)\)$/)
    public thatANestedOptionHasAnInnerTypeOfTuple2WithATypeOfValuesOf(types: string, val1: string, val2: number) {
        const innerTuple = new CLTuple2([new CLString(val1), new CLU256(val2.toString())]);
        this.clValueOption = new CLOption(Some(innerTuple));
    }

    @given(/^the inner type is Tuple2 with a type of "([^"]*)" and a value of \("([^"]*)", (\d+)\)$/)
    public theInnerTypeIsTuple2WithATypeOfAndAValueOf(type: string, val1: string, val2: number) {
        expect(this.clValueOption.isSome()).is.true;
        const inner: any = this.clValueOption.data;
        expect(inner.val.data[0].value()).to.be.eql(val1);
        expect(inner.val.data[1].value().toNumber()).to.be.eql(val2);
    }

    @given(/^that a nested Option has an inner type of Map with a type of "([^"]*)" value of \{"([^"]*)": (\d+)\}$/)
    public thatANestedOptionHasAnInnerTypeOfMapWithATypeOfValueOf(type: string, key: string, value: number) {

        const clTypes = ClTypeUtils.getCLTypes(type);
        const innerMap = new CLMap([
            [this.cLValueFactory.createValue(clTypes[0], key), this.cLValueFactory.createValue(clTypes[1], value.toString())]
        ]);
        this.clValueOption = new CLOption(Some(innerMap));
    }

    @given(/^the inner type is Map with a type of "([^"]*)" and a value of \{"([^"]*)": (\d+)\}$/)
    public theInnerTypeIsMapWithATypeOfAndAValueOf(type: string, key: string, val: number) {
        const inner = this.clValueOption.data as any;
        expect(inner.val.data[0][0].value()).to.be.eql(key);
        expect(inner.val.data[0][1].value().toNumber()).to.be.eql(val);
    }

    @given(/^that a nested Option has an inner type of Any with a value of "([^"]*)"$/)
    public thatANestedOptionHasAnInnerTypeOfAnyWithAValueOf(value: string) {
        throw new Error("Any not implemented yet");
    }

    @given(/^the inner type is Any with a value of "([^"]*)"$/)
    public theInnerTypeIsAnyWithAValueOf(value: string) {
        throw new Error("Any not implemented yet");
    }

    private getIndex(nth: string): number {
        return (+nth.substring(0, 1)) - 1;
    }
}
