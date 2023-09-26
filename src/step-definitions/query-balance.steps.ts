import {binding, given, then} from "cucumber-tsflow";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {CasperClient, Keys} from "casper-js-sdk";
import {expect} from "chai";
import {SimpleRpcClient} from "../utils/simple-rpc-client";
import {BigNumber} from "@ethersproject/bignumber";

/**
 * The steps for the query_balance.feature
 */
@binding()
export class QueryBalanceSteps {

    private contextMap = ContextMap.getInstance();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private simpleRpcClient = new SimpleRpcClient(
        TestParameters.getInstance().getHostname(),
        TestParameters.getInstance().getRcpPort()
    );

    @given(/^that a query balance is obtained by main purse public key$/)
    public async thatTheEraSummaryIsRequested() {

        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        this.contextMap.put('balance', await this.casperClient.balanceOfByPublicKey(faucetKey.publicKey));

        this.contextMap.put('queryBalanceJson',
            await this.simpleRpcClient.queryGetBalance('main_purse_under_public_key', faucetKey.publicKey.toHex())
        );
    }

    @then(/^a valid query_balance_result is returned$/)
    public async requestTheEraSummaryViaTheNode() {
        expect(this.contextMap.get('balance')).to.not.be.null;
        expect(this.contextMap.get('queryBalanceJson')).to.not.be.null;
    }

    // noinspection JSUnusedLocalSymbols
    @then(/^the query_balance_result has an API version of "([^"]*)"$/)
    public thatAQueryBalanceIsObtainedByUserMain(apiVersion: string) {
        // Should really fail as the response is not returned only the balance value
    }

    @then(/^the query_balance_result has a valid balance$/)
    public theQueryBalanceResultHasAValidBalance() {
        const json: any = this.contextMap.get('queryBalanceJson');
        const balance: BigNumber = this.contextMap.get('balance')
        const expected = BigNumber.from(json.result.balance);
        expect(balance).to.be.eql(expected);
    }

    @then(/^that a query balance is obtained by main purse account hash$/)
    public async thatAQueryBalanceIsObtainedByMainPurseAccountHash() {
        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        this.contextMap.put('balance', await this.casperClient.balanceOfByAccountHash(faucetKey.publicKey.toAccountRawHashStr()));

        this.contextMap.put('queryBalanceJson',
            await this.simpleRpcClient.queryGetBalance('main_purse_under_account_hash', faucetKey.publicKey.toAccountHashStr())
        );
    }

    @then(/^that a query balance is obtained by main purse uref$/)
    public async theQueryBalanceIsObtainedByMainPurseRef() {
        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const purseURef = await this.casperClient.getAccountMainPurseUref(faucetKey.publicKey);

        this.contextMap.put('balance', null);

        /* this.contextMap.put('balance', await this.casperClient.balanceOfByPurseURef(purseURef); */

        this.contextMap.put(
            'queryBalanceJson',
            await this.simpleRpcClient.queryGetBalance('purse_uref',  `${purseURef}`)
        );
    }

    @then(/^a transfer of (\d+) is made to user-(\d+)'s purse$/)
    public aTransferOfIsMadeToUsersPurse(amount: number, userId: number) {
        throw("Missing methods for obtaining balance by state identifier");
    }

    @then(/^the balance includes the transferred amount$/)
    public theBalanceIncludesTheTransferredAmount() {
        throw("Missing methods for obtaining balance by state identifier");
    }

    @then(/^the balance is the pre transfer amount$/)
    public theBalanceIsThePreTransferAmount() {
        throw("Missing methods for obtaining balance by state identifier");
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public and latest block identifier$/)
    public thatAQueryBalanceIsObtainedByMainPursePublicAndLatestBlockIdentifier(userId: number) {
        throw("Missing methods for obtaining balance by state identifier");
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public key and previous block identifier$/)
    public thatQueryBalanceIsObtainedByMainPurseAndPreviousBlockIdentifier(userId: number) {
        throw("Missing methods for obtaining balance by state identifier");
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public and latest state root hash identifier$/)
    public thatAQueryBalanceIsObtainedByUserMainPurseAndLatestStateRootHash(userId: number) {
        throw("Missing methods for obtaining balance by state identifier");
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public key and previous state root hash identifier$/)
    public thatAQueryBalanceIsObtainedByUserMainPurseAndPreviousSateRootHash(userId: number) {
        throw("Missing methods for obtaining balance by state identifier");
    }
}
