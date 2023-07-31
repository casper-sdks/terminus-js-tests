import {ContextMap} from "../utils/context-map";
import {CasperClient, CLTypeTag, CLValueParsers, DeployUtil, Keys, NamedArg} from "casper-js-sdk";
import {CLValueFactory} from "../utils/cl-value.factory";
import {ClTypeUtils} from "../utils/cl-type-utils";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";
import {expect} from "chai";
import {binding, given, then, when} from "cucumber-tsflow";
import {BigNumber} from "@ethersproject/bignumber";
import {TestParameters} from "../utils/test-parameters";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {GetDeployResult} from "casper-js-sdk/dist/services";

/**
 * The steps definitions for the cl_values.feature
 */
@binding()
export class ClValuesSteps {

    private contextMap = ContextMap.getInstance();
    private cLValueFactory = new CLValueFactory();
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());

    @given(/^that a CL value of type "([^"]*)" has a value of "([^"]*)"$/)
    public thatACLValueOfTypeHasAValueOf(typeName: string, strValue: string) {

        console.info("Given that a CL value of type {} has a value of {}", typeName, strValue);

        const value = this.cLValueFactory.createValue(ClTypeUtils.getCLType(typeName), strValue);

        this.addValueToContext(value);
    }

    @then(/^it's bytes will be "([^"]*)"$/)
    public itSBytesWillBe(hexBytes: string) {
        const clValue: CLValue = this.contextMap.get("clValue");

        if (clValue.clType().tag == CLTypeTag.Key) {
            hexBytes = '01' + hexBytes;
        }
        const expectedBytes = Uint8Array.from(Buffer.from(hexBytes, 'hex'));
        // In JS libs
        const actualBytes = CLValueParsers.toBytes(clValue).val;
        expect(actualBytes).to.be.eql(expectedBytes);
    }

    @when(/^the values are added as arguments to a deploy$/)
    public theValuesAreAddedAsArgumentsToADeploy() {

        const amount = BigNumber.from('2500000000');
        const senderKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-1/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const receiverKeyPair = this.casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-2/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const id = BigNumber.from(Math.round(Math.random()));
        const gasPrice: number = 1;
        const ttl = DeployUtil.dehumanizerTTL('30m');

        const transfer = DeployUtil.ExecutableDeployItem.newTransfer(amount, receiverKeyPair.publicKey, undefined, id);
        expect(transfer).to.not.be.undefined;

        const clValues: Array<NamedArg> = this.contextMap.get("clValues");
        clValues.forEach(namedArg => {
            transfer.transfer?.args.insert(namedArg.name, namedArg.value);
        });

        const standardPayment = DeployUtil.standardPayment(BigNumber.from(100000000));
        expect(standardPayment).to.not.be.undefined;

        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, "casper-net-1", gasPrice, ttl);
        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        this.casperClient.signDeploy(deploy, senderKeyPair);

        this.contextMap.put('putDeploy', deploy);

        expect(this.contextMap.get('deployResult')).to.not.be.null;
    }

    @then(/^the deploy body hash is "([^"]*)"$/)
    public theDeployBodyHashIs(bodyHash: string) {

        const deploy: Deploy = this.contextMap.get("putDeploy");
        expect(deploy.header.bodyHash).to.be.eql(bodyHash);
    }

    @when(/^the deploy is put on chain$/)
    public async theDeployIsPutOnChain() {

        const deploy: Deploy = this.contextMap.get("putDeploy");

        this.contextMap.put("deployResult", await this.casperClient.putDeploy(deploy));

        /*
         Deploy deploy = contextMap.get(PUT_DEPLOY);

         DeployResult deployResult = casperService.putDeploy(deploy);
        assertThat(deployResult.getDeployHash(), is(notNullValue()));
        contextMap.put(DEPLOY_RESULT, deployResult);

         */
    }

    @then(/^the deploy has successfully executed$/, undefined, 300000)
    public async theDeployHasSuccessfullyExecuted() {

        const deployResult = await this.casperClient.nodeClient.waitForDeploy(this.contextMap.get('putDeploy'), 300000);
        expect(deployResult).to.not.be.undefined;
        const execution_results = (<any>deployResult).execution_results;
        expect(execution_results).to.have.length.gt(0);
        expect(execution_results[0].result.Success).to.not.be.undefined;
    }

    @when(/^the deploy is obtained from the node$/)
    public async theDeployIsObtainedFromTheNode() {

        const deploy = await this.casperClient.getDeploy(this.contextMap.get("deployResult"));
        expect(deploy).to.not.be.undefined;
        this.contextMap.put('getDeploy', deploy);
    }

    @then(/^the deploys NamedArgument "([^"]*)" has a value of "([^"]*)" and bytes of "([^"]*)"$/)
    public theDeploysNamedArgumentHasAValueOfAndBytesOf(name: string, strValue: string, hexBytes: string) {

        const deployResult: [Deploy, GetDeployResult] = this.contextMap.get('getDeploy');
        const deploy = deployResult[0];
        let arg = deploy.session.getArgByName(name);

        expect(arg).to.not.be.undefined;
        /*

         DeployData deploy = this.contextMap.get(GET_DEPLOY);
         Optional<NamedArg<?>> optionalNamedArg = deploy.getDeploy().getSession().getArgs().stream().filter(namedArg -> name.equals(namedArg.getType())).findFirst();
        assertThat(optionalNamedArg.isPresent(), is(true));

         Object value = CLTypeUtils.convertToCLTypeValue(name, strValue);

         NamedArg<?> namedArg = optionalNamedArg.get();
        assertThat(namedArg.getClValue().getValue(), is(value));
        assertThat(namedArg.getClValue().getBytes(), is(hexBytes));
        assertThat(namedArg.getClValue().getClType().getTypeName(), is(name));
        assertThat(namedArg.getClValue().getBytes(), is(hexBytes));
         */

    }

    @given(/^that the CL complex value of type "([^"]*)" with an internal types of "([^"]*)" values of "([^"]*)"$/)
    public thatTheCLComplexValueOfTypeWithAnInternalTypesOfValuesOf(type: string, innerTypes: string, innerValues: string) {

        const types = this.getInnerClTypeData(innerTypes);
        const values = innerValues.split(",");
        const complexValue = this.cLValueFactory.createComplexValue(ClTypeUtils.getCLType(type), types, values);
        this.addValueToContext(complexValue);
    }


    @then(/^the deploys NamedArgument Complex value "([^"]*)" has internal types of "([^"]*)" and values of "([^"]*)" and bytes of "([^"]*)"$/)
    public theDeploysNamedArgumentComplexValueHasInternalValuesOfAndBytesOf(name: string, types: string, values: string, bytes: string) {
        /*
         DeployData deploy = this.contextMap.get(GET_DEPLOY);
         Optional<NamedArg<?>> optionalNamedArg = deploy.getDeploy().getSession().getArgs().stream().filter(namedArg -> name.equals(namedArg.getType())).findFirst();
        assertThat(optionalNamedArg.isPresent(), is(true));

         NamedArg<?> namedArg = optionalNamedArg.get();

        switch (CLTypeData.getTypeByName(namedArg.getType())) {
            case LIST:
                assertList((CLValueList) namedArg.getClValue(), types, values);
                break;

            case MAP:
                assertMap((CLValueMap) namedArg.getClValue(), types, values);
                break;

            case OPTION:
                assertOption((CLValueOption) namedArg.getClValue(), types, values);
                break;

            case TUPLE1:
                assertTupleOne((CLValueTuple1) namedArg.getClValue(), types, values);
                break;

            case TUPLE2:
                assertTupleTwo((CLValueTuple2) namedArg.getClValue(), types, values);
                break;

            case TUPLE3:
                assertTupleThree((CLValueTuple3) namedArg.getClValue(), types, values);
                break;
            default:
                throw new IllegalArgumentException("Not a supported  complex type " + namedArg.getType());
        }

        assertThat(namedArg.getClValue().getBytes(), is(bytes));

         */
    }

    private assertList(clValue: any, types: string, values: string) {

        /*
         CLValueList complexValue = (CLValueList) this.cLValueFactory.createComplexValue(CLTypeData.LIST, getInnerClTypeData(types), Arrays.asList(values.split(",")));

         List<? extends AbstractCLValue<?, ?>> value = clValue.getValue();
        assertThat(value, hasSize(5));

         Iterator<? extends AbstractCLValue<?, ?>> iterator = complexValue.getValue().iterator();

        for (AbstractCLValue<?, ?> abstractCLValue : value) {
            assertClValues(abstractCLValue, iterator.next());
        }

         */
    }

    private assertMap(clValue: any, types: string, values: string) {
        /*
                 CLValueMap complexValue = (CLValueMap) this.cLValueFactory.createComplexValue(CLTypeData.MAP, getInnerClTypeData(types), Arrays.asList(values.split(",")));

                 Set<? extends Map.Entry<? extends AbstractCLValue<?, ?>, ? extends AbstractCLValue<?, ?>>> thatEntries = complexValue.getValue().entrySet();
                 Iterator<? extends Map.Entry<? extends AbstractCLValue<?, ?>, ? extends AbstractCLValue<?, ?>>> iterEntries = clValue.getValue().entrySet().iterator();

                for (Map.Entry<? extends AbstractCLValue<?, ?>, ? extends AbstractCLValue<?, ?>> entry : thatEntries) {

                     Map.Entry<? extends AbstractCLValue<?, ?>, ? extends AbstractCLValue<?, ?>> next = iterEntries.next();

                    assertClValues(entry.getKey(), next.getKey());
                    assertClValues(entry.getValue(), next.getValue());
                }

         */
    }

    private assertTupleThree(clValue: any, types: string, values: string) {
        /*
                 CLValueTuple3 complexValue = (CLValueTuple3) this.cLValueFactory.createComplexValue(CLTypeData.TUPLE3, getInnerClTypeData(types), Arrays.asList(values.split(",")));

                assertClValues(clValue.getValue().getValue0(), complexValue.getValue().getValue0());
                assertClValues(clValue.getValue().getValue1(), complexValue.getValue().getValue1());
                assertClValues(clValue.getValue().getValue2(), complexValue.getValue().getValue2());

         */
    }

    private assertTupleTwo(clValue: any, types: string, values: string) {
        /*
                 CLValueTuple2 complexValue = (CLValueTuple2) this.cLValueFactory.createComplexValue(CLTypeData.TUPLE2, getInnerClTypeData(types), Arrays.asList(values.split(",")));

                assertClValues(clValue.getValue().getValue0(), complexValue.getValue().getValue0());
                assertClValues(clValue.getValue().getValue1(), complexValue.getValue().getValue1());

         */
    }

    private assertTupleOne(clValue: any, types: string, values: string) {
        /*
                 AbstractCLValue<?, ?> innerValue = this.cLValueFactory.createValue(CLTypeData.getTypeByName(types), values);
                assertClValues(clValue.getValue().getValue0(), innerValue);

         */
    }

    private assertOption(clValue: any, types: string, values: string) {
        /*
                 AbstractCLValue<?, ?> innerValue = this.cLValueFactory.createValue(CLTypeData.getTypeByName(types), values);
                assertThat(clValue.getValue().isPresent(), is(true));
                assertClValues(clValue.getValue().get(), innerValue);

         */
    }

    private assertClValues(actual: any, expected: any) {
        /* assertThat(actual.getValue(), is(expected.getValue()));
            assertThat(actual.getClType(), is(expected.getClType()));

     */
    }


    private addValueToContext(value: CLValue) {

        this.contextMap.put("clValue", value);

        let clValues: Array<NamedArg> = this.contextMap.get("clValues");
        if (!clValues) {
            clValues = new Array<NamedArg>();
            this.contextMap.put("clValues", clValues);
        }

        clValues.push(new NamedArg(value.clType().tag.toString(), value));
    }

    private getInnerClTypeData(innerTypes: string): CLTypeTag[] {

        let types = new Array<CLTypeTag>();

        innerTypes.split(',').forEach(strType => {
            types.push(ClTypeUtils.getCLType(strType.trim()));
        })

        return types;
    }
}
