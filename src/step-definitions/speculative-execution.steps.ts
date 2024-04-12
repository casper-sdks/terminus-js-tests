import {CasperClient, JsonBlock, Keys} from "casper-js-sdk";
import {binding, given, then} from "cucumber-tsflow"
import {TestParameters} from "../utils/test-parameters";
import {DeployUtils} from "../utils/deploy-utils";
import {BigNumber} from "@ethersproject/bignumber";
import {expect} from "chai";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";

@binding()
export class SpeculativeExecutionSteps {
    private casperSpxClient = new CasperClient(TestParameters.getInstance().getSpxUrl());
    private casperRcpClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    private speculativeDeployData: any;
    private deploy: Deploy = {} as Deploy;


    @given(/^that the "([^"]*)" account transfers (\d+) to user\-1 account with a gas payment amount of (\d+) using the speculative_exec RPC API$/, undefined, 30000)
    public async that_the_account_transfers_to_user_account_with_a_gas_payment_amount_of_using_the_speculative_exec_RPC_API(faucet: string, transferAmount: number, paymentAmount: number) {

        const faucetKey = this.casperSpxClient.loadKeyPairFromPrivateFile(
            `./assets/net-1/${faucet}/secret_key.pem`,
            Keys.SignatureAlgorithm.Ed25519
        );

        const user1Key = this.casperSpxClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-1/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        this.deploy = DeployUtils.buildStandardTransferOfAmountDeploy(this.casperSpxClient, faucetKey, user1Key, BigNumber.from(transferAmount), []);

        const latestBlockInfo = await this.casperRcpClient.nodeClient.getLatestBlockInfo();

        this.speculativeDeployData = await this.casperSpxClient.speculativeDeploy( this.deploy, {Hash: (<JsonBlock>latestBlockInfo.block).hash});
    }

    @then(/^the speculative_exec has an api_version of "([^"]*)"$/)
    public the_speculative_exec_has_an_api_version_of(version: any) {
        expect(this.speculativeDeployData.api_version).to.be.eql(version);
    }

    @then(/^a valid speculative_exec_result will be returned with (\d+) transforms$/)
    public a_valid_speculative_exec_result_will_be_returned_with_transforms(transformations: number) {
        expect(this.speculativeDeployData.execution_result.Success.effect.transforms.length).to.be.eql(transformations);
    }

    @then(/^the speculative_exec has a valid block_hash$/)
    public the_speculative_exec_has_a_valid_block_hash() {
        expect(this.speculativeDeployData.block_hash.length).to.be.eql(64);
    }

    @then(/^the execution_results contains a cost of (\d+)$/)
    public the_execution_results_contains_a_cost_of(cost: number) {
        expect(this.speculativeDeployData.execution_result.Success.cost).to.be.eql(cost.toString());
    }

    @then(/^the speculative_exec has a valid execution_result$/)
    public the_speculative_exec_has_a_valid_execution_result() {
        const transfer = this.speculativeDeployData.execution_result.Success.transfers[0];
        expect(transfer.startsWith("transfer-")).to.be.true;
    }

    @then(/^the speculative_exec execution_result transform wth the transfer key contains the deploy_hash$/)
    public the_speculative_exec_execution_result_transform_wth_the_transfer_key_contains_the_deploy_hash() {
        const transform = this.getTransform("transfer");
        const hex = Buffer.from(this.deploy.hash).toString('hex');
        expect(transform.transform.WriteTransfer.deploy_hash).to.be.eql(hex);

    }

    @then(/^the speculative_exec execution_result transform with the transfer key has the amount of (\d+)$/)
    public the_speculative_exec_execution_result_transform_with_the_transfer_key_has_the_amount_of(amount: number) {
        const transform = this.getTransform("transfer");
        expect(transform.transform.WriteTransfer.amount).to.be.eql(amount.toString());
    }

    @then(/^the speculative_exec execution_result transform with the transfer key has the "([^"]*)" field set to the "([^"]*)" account hash$/)
    public the_speculative_exec_execution_result_transform_with_the_transfer_key_has_the_field_set_to_the_account_hash(fieldName: string, account: string) {
        const transform = this.getTransform("transfer");
      // TODO  expect(transform.transform.WriteTransfer.amount).to.be.eql(amount.toString());
    }



    @then(/^the speculative_exec execution_result transform with the transfer key has the "([^"]*)" field set to the purse uref of the "([^"]*)" account$/)
    public the_speculative_exec_execution_result_transform_with_the_transfer_key_has_the_field_set_to_the_purse_uref_of_the_account(fieldName: string, account: string) {
    }

    @then(/^the speculative_exec execution_result transform with the deploy key has the deploy_hash of the transfer's hash$/)
    public the_speculative_exec_execution_result_transform_with_the_deploy_key_has_the_deploy_hash_of_the_transfer_s_hash() {
    }

    @then(/^the speculative_exec execution_result transform with a deploy key has a gas field of (\d+)$/)
    public the_speculative_exec_execution_result_transform_with_a_deploy_key_has_a_gas_field_of(arg1: number) {
    }

    @then(/^the speculative_exec execution_result transform with a deploy key has (\d+) transfer with a valid transfer hash$/)
    public the_speculative_exec_execution_result_transform_with_a_deploy_key_has_transfer_with_a_valid_transfer_hash(arg1: number) {
    }

    @then(/^the speculative_exec execution_result transform with a deploy key has as from field of the "([^"]*)" account hash$/)
    public the_speculative_exec_execution_result_transform_with_a_deploy_key_has_as_from_field_of_the_account_hash(arg1: string) {
    }

    @then(/^the speculative_exec execution_result transform with a deploy key has as source field of the "([^"]*)" account purse uref$/)
    public the_speculative_exec_execution_result_transform_with_a_deploy_key_has_as_source_field_of_the_account_purse_uref(arg1: string) {
    }

    @then(/^the speculative_exec execution_result contains at least (\d+) valid balance transforms$/)
    public the_speculative_exec_execution_result_contains_at_least_valid_balance_transforms(arg1: number) {
    }

    @then(/^the speculative_exec execution_result 1st balance transform is an Identity transform$/)
    public the_speculative_exec_execution_result_1st_balance_transform_is_an_identity_transform() {
    }

    @then(/^the speculative_exec execution_result last balance transform is an Identity transform is as WriteCLValue of type "([^"]*)"$/)
    public the_speculative_exec_execution_result_last_balance_transform_is_an_identity_transform_is_as_writeclvalue_of_type(arg1: string) {
    }

    @given(/^the speculative_exec execution_result contains a valid AddUInt512 transform with a value of (\d+)$/)
    public the_speculative_exec_execution_result_contains_a_valid_adduint512_transform_with_a_value_of(arg1: number) {

    }

    private getTransform(key: string) : any {

        return this.speculativeDeployData.execution_result.Success.effect.transforms.find((transform: any) => {
            return transform.key.startsWith(key);
        });
    }
}
