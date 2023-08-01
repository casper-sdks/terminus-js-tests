import {
    BOOL_TYPE,
    BYTE_ARRAY_TYPE,
    CLTypeTag,
    I32_TYPE,
    I64_TYPE,
    KEY_TYPE,
    LIST_TYPE,
    MAP_TYPE,
    OPTION_TYPE,
    PUBLIC_KEY_TYPE,
    STRING_TYPE,
    TUPLE1_TYPE,
    TUPLE2_TYPE,
    TUPLE3_TYPE,
    U128_TYPE,
    U256_TYPE,
    U32_TYPE,
    U512_TYPE,
    U64_TYPE,
    U8_TYPE,
    UREF_TYPE
} from "casper-js-sdk";
import {assert} from "chai";

export class ClTypeUtils {

    public static getCLType(typeName: string): CLTypeTag {

        switch (typeName) {
            case BOOL_TYPE:
                return CLTypeTag.Bool;
            case BYTE_ARRAY_TYPE:
                return CLTypeTag.ByteArray;
            case I32_TYPE:
                return CLTypeTag.I32;
            case I64_TYPE:
                return CLTypeTag.I64;
            case KEY_TYPE:
                return CLTypeTag.Key;
            case LIST_TYPE:
                return CLTypeTag.List;
            case MAP_TYPE:
                return CLTypeTag.Map;
            case OPTION_TYPE:
                return CLTypeTag.Option;
            case PUBLIC_KEY_TYPE:
                return CLTypeTag.PublicKey;
            case STRING_TYPE:
                return CLTypeTag.String;
            case TUPLE1_TYPE:
                return CLTypeTag.Tuple1;
            case TUPLE2_TYPE:
                return CLTypeTag.Tuple2;
            case TUPLE3_TYPE:
                return CLTypeTag.Tuple3;
            case U8_TYPE:
                return CLTypeTag.U8;
            case U32_TYPE:
                return CLTypeTag.U32;
            case U64_TYPE:
                return CLTypeTag.U64;
            case U128_TYPE:
                return CLTypeTag.U128;
            case U256_TYPE:
                return CLTypeTag.U256;
            case U512_TYPE:
                return CLTypeTag.U512;
            case UREF_TYPE:
                return CLTypeTag.URef;

            default:
                assert.fail(`Invalid typeName: ${typeName}`);
        }
    }

    public static convertToCLTypeValue(typeName: string, strValue: string): any {
        switch (ClTypeUtils.getCLType(typeName)) {

            case CLTypeTag.Bool:
                return 'true' === strValue;
            case CLTypeTag.I32:
            case CLTypeTag.I64:
            case CLTypeTag.U8:
            case CLTypeTag.U32:
            case CLTypeTag.U64:
            case CLTypeTag.U128:
                return Number.parseInt(strValue);

            case CLTypeTag.PublicKey:
            case CLTypeTag.String:
            case CLTypeTag.U256:
                return strValue;

            case CLTypeTag.URef:
                return `uref-${strValue}-007`;

            default:
                assert.fail(`Invalid typeName: ${typeName}`);
        }

    }

    static isComplexType(typeName: string) {

        switch (ClTypeUtils.getCLType(typeName)) {
            case CLTypeTag.List:
            case CLTypeTag.Map:
            case CLTypeTag.Option:
            case CLTypeTag.Tuple1:
            case CLTypeTag.Tuple2:
            case CLTypeTag.Tuple3:
                return true;

            default:
                return false;
        }
    }
}
