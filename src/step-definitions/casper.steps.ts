import {binding, given, then} from 'cucumber-tsflow';
import {assert} from 'chai';
import {CasperClient, CasperServiceByJsonRPC} from "casper-js-sdk";

@binding()
export class CasperSteps {

    private casperClient = new CasperClient("http://localhost:11101/rpc");
    private rcp = new CasperServiceByJsonRPC("http://localhost:11101/rpc");

    @given(/^that a nctl node is running in docker$/)
    public givenANctlNodeIsRunningInDocket() {
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
