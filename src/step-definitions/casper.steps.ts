import {binding, given, then} from 'cucumber-tsflow';
import {assert} from 'chai';
import {CasperClient, CasperServiceByJsonRPC} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";

@binding()
export class CasperSteps {

    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private rcp = new CasperServiceByJsonRPC(TestParameters.getInstance().getRcpUrl());

    @given(/^that a nctl node is running in docker$/)
    public givenANctlNodeIsRunningInDocker() {
        assert.isNotNull(this.casperClient);
        assert.isNotNull(this.casperClient.nodeClient);
    }

    @then(/^I can connect$/)
    public theICanConnect() {
        this.rcp.getStatus().then(result => {
            assert.equal(result.api_version, "1.0.0");
        }).catch(reason => {
            assert.fail(reason);
        });
    }
}
