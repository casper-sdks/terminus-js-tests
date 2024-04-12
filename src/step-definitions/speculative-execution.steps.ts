import { binding, given, then } from "cucumber-tsflow"

@binding()
export class SpeculativeExecutionSteps {


    @given(/^that the "([^"]*)" account transfers (\d+) to user\-1 account with a gas payment amount of (\d+) using the speculative_exec RPC API$/)
    public that_the_account_transfers_to_user_account_with_a_gas_payment_amount_of_using_the_speculative_exec_RPC_API(arg1: any, arg2: any, arg3: any) {
    }

    @then(/^the speculative_exec has an api_version of "([^"]*)"$/)
    public the_speculative_exec_has_an_api_version_of(arg1: any) {

    }

    @then(/^a valid speculative_exec_result will be returned with (\d+) transforms$/)
    public a_valid_speculative_exec_result_will_be_returned_with_transforms(arg1: any) {

    }

    @then(/^the speculative_exec has a valid block_hash$/)
    public the_speculative_exec_has_a_valid_block_hash() {
    }

    @then(/^the execution_results contains a cost of (\d+)$/)
    public the_execution_results_contains_a_cost_of(cost: number) {
    }

    @then(/^the speculative_exec has a valid execution_result$/)
    public the_speculative_exec_has_a_valid_execution_result() {
    }

    @then(/^the speculative_exec execution_result transform wth the transfer key contains the deploy_hash$/)
    public the_speculative_exec_execution_result_transform_wth_the_transfer_key_contains_the_deploy_hash() {

    }

    @then(/^the speculative_exec execution_result transform with the transfer key has the amount of (\d+)$/)
    public the_speculative_exec_execution_result_transform_with_the_transfer_key_has_the_amount_of(amount: number) {

    }

    @then(/^the speculative_exec execution_result transform with the transfer key has the "([^"]*)" field set to the "([^"]*)" account hash$/)
    public the_speculative_exec_execution_result_transform_with_the_transfer_key_has_the_field_set_to_the_account_hash(fieldName: string, account: string) {
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
}
