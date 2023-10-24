import {binding, given, then} from "cucumber-tsflow";
import {CLTuple1, CLType, CLU32, CLValueParsers} from "casper-js-sdk";
import {expect} from "chai";
import {BigNumber} from "@ethersproject/bignumber";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";

@binding()
export class NestedTuplesSteps {

    private clTuple1: CLTuple1 | null = null;

    @given(/^that a nested tuple1 is defined as \(\((\d+)\)\) using U32 numeric value$/)
    public aNestedTuple1IsDefinedAsUsingU32NumericValue(value: number) {
        let innerValue = new CLU32(value);
        this.clTuple1 = new CLTuple1([innerValue]);
    }

    @then(/^the first element of the tuple1 is \((\d+)\)$/)
    public theFirstElementOfTheTupleIs1(value: number) {
        let innerValue = (this.clTuple1 as CLTuple1).get(0);
        expect(innerValue.value()).is.eql(BigNumber.from(value));
    }

    @then(/^the tuple1 bytes are "([^"]*)"$/)
    public theTupleBytesAre(hexBytes: string) {
        let tuple: CLTuple1 | null = this.clTuple1;
        let actual = CLValueParsers.toBytes(tuple as CLValue).val;
        let expected = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        expect(actual).to.eql(expected);
    }

}

/*
Then(/^the first element of the tuple1 is \(1\)$/, function () {

});
Then(, function () {

});
Given(/^that a nested tuple2 is defined as \(1, \(2, \(3, 4\)\)\) using U32 numeric value$/, function () {

});
Then(/^the first element of the tuple2 is (\d+)$/, function () {

});
Then(/^the second element of the tuple2 is \(2, \(3, 4\)\)$/, function () {

});
Then(/^the tuple2 bytes are "([^"]*)"$/, function () {

});
Given(/^that a nested tuple3 is defined as \(1, (\d+), \(3, (\d+), \(5, (\d+), 7\)\)\) using U32 numeric value$/, function () {

});
Then(/^the first element of the tuple3 is (\d+)$/, function () {

});
Then(/^the second element of the tuple3 is (\d+)$/, function () {

});
Then(/^the third element of the tuple3 is \(3, (\d+), \(5, (\d+), 7\)\)$/, function () {

});

 */
