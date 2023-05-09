import {binding, given, then} from "cucumber-tsflow";
import {ParameterMap} from "../utils/parameter-map";
import {CasperClient} from "casper-js-sdk";
import {expect} from "chai";
import {GetPeersResult} from "casper-js-sdk/dist/services/CasperServiceByJsonRPC";

/**
 * This interface is not exported by the SDK therefore we have to implement here
 */
interface Peer {
    node_id: string;
    address: string;
}

/**
 * The class that implements the steps for the info_get_peers.feature.
 *
 * @author ian@meywood.com
 */
@binding()
export class InfoGetPeerSteps {

    private parameterMap = ParameterMap.getInstance();
    private casperClient = new CasperClient("http://localhost:11101/rpc");

    @given(/^that the info_get_peers RPC method is invoked against a node$/)
    public async thatTheInfo_get_peersRPCMethodIsInvokedAgainstANode() {
        console.info("Given that the info_get_peers RPC method is invoked against a node");
        await this.casperClient.nodeClient.getPeers().then(peerData => {
            this.parameterMap.put('peerData', peerData);
        });
    }

    @then(/^the node returns an info_get_peers_result$/)
    public theNodeReturnsAnInfo_get_peers_result() {
        console.info("Then the node returns an info_get_peers_result");
        expect(this.getPeerData()).to.be.not.null;
    }


    @given(/^the info_get_peers_result has an API version of "([^"]*)"$/)
    public theInfo_get_peers_resultHasAnAPIVersionOf(apiVersion: string) {
        console.info(`And the info_get_peers_result has an API version of ${apiVersion}`);
        expect(this.getPeerData().api_version).is.eql(apiVersion);
    }

    @then(/^the info_get_peers_result contains (\d+) peers$/)
    public theInfo_get_peers_resultContainsPeers(peerCount: number) {
        console.info(`And info_get_peers_result contains ${peerCount} peers`);
        expect(this.getPeerData().peers).to.have.length(peerCount);
    }

    @then(/^the info_get_peers_result contains a valid peer with a port number of (\d+)$/)
    public theInfo_get_peers_resultContainAPeerWithAPortNumberOf(port: number) {
        console.info(`And the info_get_peers_result contains a valid peer with a port number of ${port}`);

        const match = this.getPeerData()
            .peers
            .filter(peer => this.isValidPeer(port, peer))

        expect(match).to.have.length(1);
    }

    private getPeerData(): GetPeersResult {
        return this.parameterMap.get('peerData');
    }

    private isValidPeer(port: number, peer: Peer) {
        return peer.address.endsWith(":" + port) && peer.node_id.startsWith("tls:");
    }
}
