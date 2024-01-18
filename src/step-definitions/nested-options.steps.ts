import {binding, given, then} from "cucumber-tsflow";

/**
 * The steps for the nested-options.feature
 */
@binding()
export class NestedOptionsSteps {
    @given(/^that a nested Option has an inner type of Option with a type of String and a value of "([^"]*)"$/)
    public aNestedOptionHasanInnerTypeofOptionWithATypeofStringAndaValueOf(value: string) {

    }

    @then(/^the inner type is Option with a type of String and a value of "([^"]*)"$/)
    public theInnerTypeIsOptionWithATypeOfStringAndAValueOf(value: string) {

    }

    @then(/^the bytes are "([^"]*)"$/)
    public theBytesAre(hexBytes: string) {

    }

    @given(/^that the nested Option is deployed in a transfer$/)
    public thatTheNestedOptionIsDeployedInATransfer() {

    }

    @given(/^the transfer containing the nested Option is successfully executed$/)
    public theTransferContainingTheNestedOptionIsSuccessfullyExecuted() {

    }

    @given(/^that a nested Option has an inner type of Tuple2 with a type of "([^"]*)" values of \("([^"]*)", (\d+)\)$/)
    public thatANestedOptionHasAnInnerTypeOfTuple2WithATypeOfValuesOf(types: string, val1: number, val2: number) {

    }

    @given(/^that a nested Option has an inner type of List with a type of U256 and a value of \((\d+), (\d+), (\d+)\)$/)
    public thatANestedOptionHasAnInnerTypeOfListWithATypeOfUAndAValueOf(val1: number, val2: number, val3: number) {

    }

    @given(/^the inner type is Tuple2 with a type of "([^"]*)" and a value of \("([^"]*)", (\d+)\)$/)
    public theInnerTypeIsTuple2WithATypeOfAndAValueOf(type: string, val1: string, val2: number) {

    }

    @given(/^that a nested Option has an inner type of Map with a type of "([^"]*)" value of \{"([^"]*)": (\d+)\}$/)
    public thatANestedOptionHasAnInnerTypeOfMapWithATypeOfValueOf(type: string, key: string, val: number) {

    }

    @given(/^the inner type is Map with a type of "([^"]*)" and a value of \{"([^"]*)": (\d+)\}$/)
    public theInnerTypeIsMapWithATypeOfAndAValueOf(type: string, key: string, val: number) {

    }

    @given(/^that a nested Option has an inner type of Any with a value of "([^"]*)"$/)
    public thatANestedOptionHasAnInnerTypeOfAnyWithAValueOf(value: string) {

    }

    @given(/^the inner type is Any with a value of "([^"]*)"$/)
    public theInnerTypeIsAnyWithAValueOf(value: string) {

    }

    @given(/^the transfer containing the nested Option is successfully execute$/)
    public theTransferContainingTheNestedOptionIsSuccessfullyExecute() {

    }
}
