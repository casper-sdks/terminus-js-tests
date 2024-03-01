import {binding, given, then, when} from "cucumber-tsflow";
import {CasperClient, CLBoolType, CLOption, CLValueParsers, JsonDeploy, NamedArg} from "casper-js-sdk";
import {None, Some} from "ts-results";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";
import {expect} from "chai";
import {CLValueFactory} from "../utils/cl-value.factory";
import {TestParameters} from "../utils/test-parameters";
import {ClTypeUtils} from "../utils/cl-type-utils";
import {DeployUtils} from "../utils/deploy-utils";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";

/**
 * The steps definitions for the option_values.feature
 */
@binding()
export class OptionValuesSteps {

    private cLValueFactory = new CLValueFactory();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private clValueOption: CLOption<CLValue> = {} as CLOption<CLValue>;
    private deploy: Deploy = {} as Deploy;
    private jsonDeploy = {} as JsonDeploy;
    private deployHash: string = '';

    @given(/^that an Option value has an empty value$/)
    thatAnOptionValueHasAnEmptyValue() {
        this.clValueOption = new CLOption(None, new CLBoolType());
    }

    @then(/^the Option value is not present$/)
    theOptionValueShouldBeInvalid() {
        expect(this.clValueOption.isNone()).to.be.true;
    }

    @then(/^the Option value's bytes are "([^"]*)"$/)
    theOptionValueBytesAre(hexBytes: string) {
        if (hexBytes.length == 0) {
            hexBytes = '00' + hexBytes;
        }
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        const actualBytes = CLValueParsers.toBytes(this.clValueOption).val;
        expect(actualBytes).to.be.eql(expectedBytes);
    }

    @given(/^an Option value contains a "([^"]*)" value of "([^"]*)"$/)
    thatAnOptionValuesHasAValueOf(typeName: string, strValue: string) {
        let innerValue = this.cLValueFactory.createValue(ClTypeUtils.getCLType(typeName), strValue);
        this.clValueOption = new CLOption(Some(innerValue));
    }

    @then("the Option value is present")
    theOptionValueIsPresent() {
        expect(this.clValueOption.isSome()).is.true;
    }

    @given(/^that the Option value is deployed in a transfer as a named argument$/)
    async thatTheOptionValueIsDeployedInATransferAsANamedArgument() {
        this.deploy = DeployUtils.buildStandardTransferDeploy(this.casperClient, [new NamedArg("option", this.clValueOption)]);
        this.deployHash = await this.casperClient.putDeploy(this.deploy);
    }

    @then(/^the transfer containing the Option value is successfully executed$/)
    theTransferContainingTheOptionValueIsSuccessfullyExecuted() {
        expect(this.deployHash).to.not.be.null;
    }

    @when(/^the Option is read from the deploy$/)
    async theOptionIsReadFromTheDeploy() {
        await this.casperClient.getDeploy(this.deployHash).then(deployAndResults => {
            this.jsonDeploy = deployAndResults[1].deploy;
        });
    }

    @then(/^the type of the Option is "([^"]*)" with a value of "([^"]*)"$/)
    theTypeOfTheOptionIsWithAValueOf(typeName: string, strValue: string) {
        const arg = DeployUtils.getNamedArgument(this.jsonDeploy, "option");
        const expectedValue: any = ClTypeUtils.convertToCLTypeValue(typeName, strValue)
        expect(arg[1].cl_type.Option).to.be.eql(typeName);
        expect(arg[1].parsed).to.be.eql(expectedValue);
    }
}
