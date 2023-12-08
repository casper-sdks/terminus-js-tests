import {binding, given, then} from "cucumber-tsflow";
import {CLTuple1, CLTuple2, CLTuple3, CLU32, CLValueParsers} from "casper-js-sdk";
import {expect} from "chai";
import {BigNumber} from "@ethersproject/bignumber";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";

@binding()
export class NestedTuplesSteps {

    private clTuple1: CLTuple1 = {} as CLTuple1;
    private clTuple2: CLTuple2 = {} as CLTuple2;
    private clTuple3: CLTuple3 = {} as CLTuple3;

    @given(/^that a nested tuple1 is defined as \(\((\d+)\)\) using U32 numeric value$/)
    public aNestedTuple1IsDefinedAsUsingU32NumericValue(value: number) {
        const innerValue = new CLU32(value);
        this.clTuple1 = new CLTuple1([innerValue]);
    }

    @given(/^that a nested tuple2 is defined as \((\d+), \((\d+), \((\d+), (\d+)\)\)\) using U32 numeric value$/)
    public aNestedTuple2IsDefinedAs(value1: number, value2: number, value3: number, value4: number) {
        this.clTuple2 = new CLTuple2(
            [new CLU32(value1),
                new CLTuple2(
                    [new CLU32(value2),
                        new CLTuple2([new CLU32(value3), new CLU32(value4)])])]
        );
    }

    @given(/^that a nested tuple3 is defined as \((\d+), (\d+), \((\d+), (\d+), \((\d+), (\d+), (\d+)\)\)\) using U32 numeric value$/)
    public aNestedTuple3IsDefinedAs(val1: number, val2: number, val3: number, val4: number, val5: number, val6: number, val7: number) {
        this.clTuple3 = new CLTuple3([
            new CLU32(val1),
            new CLU32(val2),
            new CLTuple3([
                new CLU32(val3),
                new CLU32(val4),
                new CLTuple3([
                    new CLU32(val5), new CLU32(val6), new CLU32(val7)
                ])
            ])
        ]);
    }

    @then(/^the first element of the tuple1 is \((\d+)\)$/)
    public theFirstElementOfTheTupleIs1(value: number) {
        const innerValue = (this.clTuple1 as CLTuple1).get(0);
        expect(innerValue.value()).is.eql(BigNumber.from(value));
    }

    @then(/^the first element of the tuple2 is (\d+)$/)
    public theFirstElementOfTheTuple2Is(value: number) {
        const firstElement = this.clTuple2.get(0);
        expect(firstElement.value()).is.eql(BigNumber.from(value));
    }

    @then(/^the first element of the tuple3 is (\d+)$/)
    public theFirstElementOfTheTuple3Is(value: number) {
        const firstElement = this.clTuple3.get(0);
        expect(firstElement.value()).is.eql(BigNumber.from(value));
    }

    @then(/^the second element of the tuple2 is \((\d+), \((\d+), (\d+)\)\)$/)
    public theSecondElementOfTheTuple2Is(val1: number, val2: number, val3: number) {
        const secondElement = this.clTuple2.get(1) as CLTuple2;
        expect(secondElement.get(0).value()).is.eql(BigNumber.from(val1));
        const innerTuple = secondElement.get(1) as CLTuple2;
        expect(innerTuple.get(0).value()).is.eql(BigNumber.from(val2));
        expect(innerTuple.get(1).value()).is.eql(BigNumber.from(val3));
    }

    @then(/^the second element of the tuple3 is (\d+)$/)
    public theSecondElementOfTheTuple3Is(value: number) {
        const secondElement = this.clTuple3.get(1);
        expect(secondElement.value()).is.eql(BigNumber.from(value));
    }

    @then(/^the tuple(\d+) bytes are "([^"]*)"$/)
    public theTupleBytesAre(tupleIndex: number, hexBytes: string) {
        const tuple: CLValue = this.getTuple(tupleIndex);
        const actual = CLValueParsers.toBytes(tuple as CLValue).val;
        const expected = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        expect(actual).to.eql(expected);
    }

    @then(/^the third element of the tuple3 is \((\d+), (\d+), \((\d+), (\d+), (\d+)\)\)$/)
    public theThirdElementOfTheTuple3Is(val1: number, val2: number, val3: number, val4: number, val5: number) {
        const thirdElement = this.clTuple3.get(2) as CLTuple3;
        expect(thirdElement.get(0).value()).is.eql(BigNumber.from(val1));
        expect(thirdElement.get(1).value()).is.eql(BigNumber.from(val2));
        const innerTuple = thirdElement.get(2) as CLTuple3;
        expect(innerTuple.get(0).value()).is.eql(BigNumber.from(val3));
        expect(innerTuple.get(1).value()).is.eql(BigNumber.from(val4));
        expect(innerTuple.get(2).value()).is.eql(BigNumber.from(val5));
    }

    private getTuple(tupleIndex: number): CLValue {
        switch (tupleIndex) {
            case 1:
                return this.clTuple1 as CLValue;
            case 2:
                return this.clTuple2 as CLValue;
            case 3:
                return this.clTuple3 as CLValue;
            default:
                throw "Invalid tuple index: " + tupleIndex;
        }
    }
}

/*
Then(/^the first element of the tuple1 is \(1\)$/, function () {

});
Then(, function () {

});
Given(/^ function () {

});
Then(/^the first element of the tuple2 is (\d+)$/, function () {

});
Then(, function () {

});
Then(/^the tuple2 bytes are "([^"]*)"$/, function () {

});
Given(, function () {

});
Then(, function () {

});
Then(, function () {

});
Then(/^the third element of the tuple3 is \(3, (\d+), \(5, (\d+), 7\)\)$/, function () {

});
*/