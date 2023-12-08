import {
    CLBool,
    CLByteArray,
    CLI32,
    CLI64,
    CLKey,
    CLList,
    CLMap,
    CLOption,
    CLPublicKey,
    CLString,
    CLTuple1,
    CLTuple2,
    CLTuple3,
    CLTypeTag,
    CLU128,
    CLU256,
    CLU32,
    CLU512,
    CLU64,
    CLU8,
    CLURef
} from "casper-js-sdk";
import {Some} from 'ts-results';
import {assert} from "chai";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue";

export class CLValueFactory {

    createValue(clType: CLTypeTag, strValue: string): CLValue {
        switch (clType) {
            case CLTypeTag.Bool:
                return new CLBool(strValue === 'true');
            case CLTypeTag.ByteArray:
                return new CLByteArray(Uint8Array.from(Buffer.from(strValue, 'hex')));
            case CLTypeTag.I32:
                return new CLI32(strValue);
            case CLTypeTag.I64:
                return new CLI64(strValue);
            case CLTypeTag.Key:
                return new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(strValue, 'hex'))));

            case CLTypeTag.PublicKey:
                return CLPublicKey.fromHex(strValue);
            case CLTypeTag.String:
                return new CLString(strValue);
            case CLTypeTag.U8:
                return new CLU8(strValue);
            case CLTypeTag.U32:
                return new CLU32(strValue);
            case CLTypeTag.U64:
                return new CLU64(strValue);
            case CLTypeTag.U128:
                return new CLU128(strValue);
            case CLTypeTag.U256:
                return new CLU256(strValue);
            case CLTypeTag.U512:
                return new CLU512(strValue);
            case CLTypeTag.URef:
                return CLURef.fromFormattedStr(`uref-${strValue}-007`);
            case CLTypeTag.Any: // Any type not yet supported in JS SDK
            default:
                assert.fail(`Invalid clType: ${clType}`);
        }
    }

    createComplexValue(clType: CLTypeTag, types: CLTypeTag[], values: string[]): CLValue {

        let innerValues = [];
        for (let i = 0; i < types.length; i++) {
            innerValues.push(this.createValue(types[i], values[i]));
        }

        switch (clType) {
            case CLTypeTag.Option:
                return new CLOption(Some(innerValues[0]), innerValues[0].clType());
            case CLTypeTag.Tuple1:
                return new CLTuple1(innerValues);
            case CLTypeTag.Tuple2:
                return new CLTuple2(innerValues);
            case CLTypeTag.Tuple3:
                return new CLTuple3(innerValues);
            case CLTypeTag.List:
                return new CLList(innerValues);
            case CLTypeTag.Map:
                return new CLMap(this.buildMap(innerValues));

            default:
                assert.fail(`Invalid clType: ${clType}`);
        }
    }

    private buildMap(innerValues: CLValue[]): any {
        let map = [];
        for (let i = 0; i < innerValues.length; i++) {
            map.push([new CLString('' + i), innerValues[i]]);
        }
        return map;
    }
}
