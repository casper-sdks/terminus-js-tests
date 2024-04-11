import {binding, given, then} from "cucumber-tsflow";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {assert, expect} from "chai";

/**
 * Step definitions for the info_get_validator_changes feature.
 *
 * NOTE: This rcp method is not yet implemented in the Casper TypeScript SDK
 *
 * @author ian@meywood.com
 */
@binding()
export class InfoGetValidatorChangesStep {

    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that the info_get_validator_changes method is invoked against a node$/)
    public thatTheInfo_get_validator_changesMethodIsInvokedAgainstNode() {

        console.info("Given that the info_get_validator_changes method is invoked against a node");

        // noinspection TypeScriptUnresolvedVariable
        expect((this.casperClient.nodeClient as any).getValidatorChanges, 'not implemented in TypeScript client').to.not.be.undefined;

        assert.fail('not implemented in TypeScript client');
    }

    @then(/^a valid info_get_validator_changes_result is returned$/)
    public aValidInfo_get_validator_changes_resultIsReturned() {
        console.info("Then a valid info_get_validator_changes_result is returned");

        assert.fail('not implemented in TypeScript client');
    }

    @then(/^the info_get_validator_changes_result contains a valid API version$/)
    public theInfo_get_validator_changes_resultContainsAValidAPIVersion() {
        console.info("And the info_get_validator_changes_result contains a valid API version");
        assert.fail('not implemented in TypeScript client');
    }
}
