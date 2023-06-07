import {binding, given, then} from "cucumber-tsflow";
import {ContextMap} from "../utils/context-map";
import {expect} from "chai";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {GetStatusResult} from "casper-js-sdk/dist/services/CasperServiceByJsonRPC";
import {NctlClient} from "../utils/nctl-client";

/**
 * Steps for the info_get_status RPC test feature.
 *
 * @author ian@meywood.com
 */
@binding()
export class InfoGetStatusSteps {

    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private nctlClient = new NctlClient(TestParameters.getInstance().dockerName);

    @given(/^that the info_get_status is invoked against nctl$/)
    public async thatTheInfo_get_statusIsInvoked() {
        const expectedJsonNodeStatus: any = this.getNodeStatus(1);
        expect(expectedJsonNodeStatus).to.not.be.undefined;
        this.contextMap.put('expectedJsonNodeStatus', expectedJsonNodeStatus);

        console.info("Given that the info_get_status is invoked");

        await this.casperClient.nodeClient.getStatus().then(statusData => {
            this.contextMap.put('statusData', statusData);
        });

    }

    @then(/^an info_get_status_result is returned$/)
    public anInfo_get_status_resultIsReturned() {
        console.info("Then an info_get_status_result is returned");
        const statusData: GetStatusResult = this.contextMap.get('statusData');
        expect(statusData).to.not.be.undefined;
    }

    @then(/^the info_get_status_result api_version is "([^"]*)"$/)
    public theinfo_get_status_resultapi_versionis(apiversion: string) {
        const statusdata: GetStatusResult = this.contextMap.get('statusData');
        expect(statusdata.api_version).to.eql(apiversion);
    }

    @then(/^the info_get_status_result chainspec_name is "([^"]*)"$/)
    public theInfo_get_status_resultChainspec_nameIs(chainSpecName: string) {

        console.info(`Then the info_get_status_result chainspec_name is ${chainSpecName}`);
        const statusData: any = this.contextMap.get('statusData');

        // noinspection TypeScriptUnresolvedVariable
        expect(statusData.chainspec_name).to.eql(chainSpecName);
    }

    @then(/^the info_get_status_result has a valid last_added_block_info$/)
    public theInfo_get_status_resultHasAValidLast_added_block_info() {

        console.info(`Then the info_get_status_result has a valid last_added_block_info`);

        const statusData: GetStatusResult = this.contextMap.get('statusData');
        const jsonNode: any = this.contextMap.get('expectedJsonNodeStatus');
        const expectedHash = jsonNode.last_added_block_info.hash;
        const expectedTimestamp = jsonNode.last_added_block_info.timestamp;
        const expectedEraId = jsonNode.last_added_block_info.era_id;
        const expectedHeight = jsonNode.last_added_block_info.height;
        const expectedStateRootHash = jsonNode.last_added_block_info.state_root_hash;
        const expectedCreator = jsonNode.last_added_block_info.creator;

        expect(statusData.last_added_block_info.hash).to.eql(expectedHash);
        expect(statusData.last_added_block_info.timestamp).to.eql(expectedTimestamp);
        expect(statusData.last_added_block_info.era_id).to.eql(expectedEraId);
        expect(statusData.last_added_block_info.height).to.eql(expectedHeight);
        expect(statusData.last_added_block_info.state_root_hash).to.eql(expectedStateRootHash);
        expect(statusData.last_added_block_info.creator).to.eql(expectedCreator);
    }

    @then(/^the info_get_status_result has a valid our_public_signing_key$/)
    public theInfo_get_status_resultHasAValidOur_public_signing_key() {

        console.info(`Then the info_get_status_result has a valid our_public_signing_key`);

        const statusData: any = this.contextMap.get('statusData');
        const jsonNode: any = this.contextMap.get('expectedJsonNodeStatus');

        // noinspection TypeScriptUnresolvedVariable
        expect(statusData.our_public_signing_key).to.eql(jsonNode.our_public_signing_key);
    }

    @then(/^the info_get_status_result has a valid starting_state_root_hash$/)
    public theInfo_get_status_resultHasAValidStarting_state_root_hash() {

        console.info(`Then the info_get_status_result has a valid starting_state_root_hash`);

        const statusData: any = this.contextMap.get('statusData');
        const jsonNode: any = this.contextMap.get('expectedJsonNodeStatus');

        // noinspection TypeScriptUnresolvedVariable
        expect(statusData.starting_state_root_hash).to.eql(jsonNode.starting_state_root_hash);
    }

    @then(/^the info_get_status_result has a valid build_version$/)
    public theInfo_get_status_resultHasAValidBuild_version() {

        console.info(`Then the info_get_status_result has a valid build_version`);

        const statusData: any = this.contextMap.get('statusData');
        const jsonNode: any = this.contextMap.get('expectedJsonNodeStatus');

        expect(statusData.build_version).to.eql(jsonNode.build_version);
    }

    @then(/^the info_get_status_result has a valid round_length$/)
    public theInfo_get_status_resultHasAValidRound_length() {

        console.info(`Then the info_get_status_result has a valid round_length`);

        const statusData: any = this.contextMap.get('statusData');
        const jsonNode: any = this.contextMap.get('expectedJsonNodeStatus');

        // noinspection TypeScriptUnresolvedVariable
        expect(statusData.round_length).to.eql(jsonNode.round_length);
    }

    @then(/^the info_get_status_result has a valid uptime$/)
    public theInfo_get_status_resultHasAValidUptime() {

        console.info(`Then the info_get_status_result has a valid uptime`);

        const statusData: any = this.contextMap.get('statusData');

        expect(statusData.uptime).to.contain("h ");
        expect(statusData.uptime).to.contain("m ");
        expect(statusData.uptime).to.contain("s ");
        expect(statusData.uptime.endsWith("ms")).to.be.true;
    }

    @then(/^the info_get_status_result has a valid peers$/)
    public theInfo_get_status_resultHasAValidPeers() {

        console.info(`Then the info_get_status_result has a valid peers`);

        const statusData: GetStatusResult = this.contextMap.get('statusData');
        const jsonNode: any = this.contextMap.get('expectedJsonNodeStatus');

        expect(statusData.peers).to.have.length(jsonNode.peers.length);
        expect(statusData.peers[0].address).to.eql(jsonNode.peers[0].address);
        expect(statusData.peers[0].node_id).to.eql(jsonNode.peers[0].node_id);

        expect(statusData.peers[3].address).to.eql(jsonNode.peers[3].address);
        expect(statusData.peers[3].node_id).to.eql(jsonNode.peers[3].node_id);
    }

    private getNodeStatus(nodeId: number): any {
        // Obtain from nctl
        return this.nctlClient.getNodeStatus(nodeId);
    }
}
