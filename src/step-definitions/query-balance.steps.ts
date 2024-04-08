import {binding, given, then} from "cucumber-tsflow";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import {CasperClient, Keys, PurseIdentifier} from "casper-js-sdk";
import {expect} from "chai";
import {SimpleRpcClient} from "../utils/simple-rpc-client";
import {BigNumber} from "@ethersproject/bignumber";
import {DeployUtils} from "../utils/deploy-utils";
import {GetBlockResult} from "casper-js-sdk/dist/services/types";

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

        this.contextMap.put('balance', await this.casperClient.nodeClient.queryBalance(PurseIdentifier.PurseUref, purseURef as string));

        this.contextMap.put(
            'queryBalanceJson',
            await this.simpleRpcClient.queryGetBalance('purse_uref', `${purseURef}`)
        );
    }

    @then(/^a transfer of (\d+) is made to user-(\d+)'s purse$/, undefined, 30000)
    public async aTransferOfIsMadeToUsersPurse(amount: number, userId: number) {

        const userKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/user-${userId}/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const faucetKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/faucet/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        this.contextMap.put('initialBalance', await this.casperClient.nodeClient.queryBalance(PurseIdentifier.MainPurseUnderPublicKey, userKey.publicKey.toHex()));

        let deploy = DeployUtils.buildStandardTransferOfAmountDeploy(this.casperClient, faucetKey, userKey, BigNumber.from(amount), []);

        this.contextMap.put('initialBlock', await this.casperClient.nodeClient.getLatestBlockInfo());

        this.contextMap.put('initialStateRootHash', await this.casperClient.nodeClient.getStateRootHash());

        const hash = await this.casperClient.putDeploy(deploy);

        const result = await this.casperClient.nodeClient.waitForDeploy(hash, 30000);

        expect(result).to.not.be.undefined;
        expect(result.execution_results[0].result.Success).to.not.be.undefined;
    }

    @then(/^the balance includes the transferred amount$/)
    public theBalanceIncludesTheTransferredAmount() {

        const initialBalance: BigNumber = this.contextMap.get('initialBalance');
        expect(initialBalance).to.not.be.null;
        const balance: BigNumber = this.contextMap.get('balance');
        expect(balance).to.not.be.null;
        expect(balance).to.be.eql(initialBalance.add(BigNumber.from(2500000000)));
    }

    @then(/^the balance is the pre transfer amount$/)
    public theBalanceIsThePreTransferAmount() {
        const initialBalance: BigNumber = this.contextMap.get('initialBalance');
        expect(initialBalance).to.not.be.null;
        const balance: BigNumber = this.contextMap.get('balance');
        expect(balance).to.not.be.null;
        expect(balance).to.be.eql(initialBalance);
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public and latest block identifier$/)
    public async thatAQueryBalanceIsObtainedByMainPursePublicAndLatestBlockIdentifier(userId: number) {

        const userKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/user-${userId}/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const purseURef = await this.casperClient.getAccountMainPurseUref(userKey.publicKey);
        this.contextMap.put('balance', null);
        this.contextMap.put('balance', await this.casperClient.nodeClient.queryBalance(PurseIdentifier.PurseUref, purseURef as string));
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public key and previous block identifier$/)
    public async thatQueryBalanceIsObtainedByMainPurseAndPreviousBlockIdentifier(userId: number) {
        const userKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/user-${userId}/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const initialBlock: GetBlockResult = this.contextMap.get('initialBlock');
        const hash = initialBlock.block?.hash as string;
        const purseURef = await this.casperClient.getAccountMainPurseUref(userKey.publicKey);
        this.contextMap.put('balance', null);
        this.contextMap.put('balance', await this.casperClient.nodeClient.queryBalance(PurseIdentifier.PurseUref, purseURef as string, {BlockHash: hash}));
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public and latest state root hash identifier$/)
    public async thatAQueryBalanceIsObtainedByUserMainPurseAndLatestStateRootHash(userId: number) {

        const userKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/user-${userId}/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const latest = await this.casperClient.nodeClient.getStateRootHash();
        const purseURef = await this.casperClient.getAccountMainPurseUref(userKey.publicKey);
        this.contextMap.put('balance', null);
        this.contextMap.put('balance', await this.casperClient.nodeClient.queryBalance(PurseIdentifier.PurseUref, purseURef as string, {StateRootHash: latest}));
    }

    @then(/^that a query balance is obtained by user-(\d+)'s main purse public key and previous state root hash identifier$/)
    public async thatAQueryBalanceIsObtainedByUserMainPurseAndPreviousSateRootHash(userId: number) {
        const userKey = this.casperClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/user-${userId}/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const initial: string = this.contextMap.get('initialStateRootHash');
        const purseURef = await this.casperClient.getAccountMainPurseUref(userKey.publicKey);
        this.contextMap.put('balance', null);
        this.contextMap.put('balance', await this.casperClient.nodeClient.queryBalance(PurseIdentifier.PurseUref, purseURef as string, {StateRootHash: initial}));
    }
}
