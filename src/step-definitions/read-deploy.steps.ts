import {Given, Then} from "@cucumber/cucumber";
import {binding, given, then} from "cucumber-tsflow";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {CasperClient} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import * as fs from "fs";
import {expect} from "chai";

/**
 * The read_deploy feature steps.
 */
@binding()
export class ReadDeploySteps {


    /** The client under test */
    private casperClient = new CasperClient(TestParameters.getInstance().getRcpUrl());
    /** The map used to share results and variables across step definitions. */
    private contextMap = ContextMap.getInstance();

    @given(/^that the "([^"]*)" JSON deploy is loaded$/)
    public thatTheJSONDeployIsLoaded(jsonFilename: string) {

        console.info("Given that the {} JSON deploy is loaded", jsonFilename);

        const buf  = fs.readFileSync(`./src/json/${jsonFilename}`);
        expect(buf).to.not.be.undefined;
        const json = "'{'deploy': " + buf.toString() + "}";

        // Log the deploy
        console.info(json);

        const parsedJson: any = { deploy: JSON.parse(buf.toString()) };

        // FIXME TS SDK needs fix to allow loading of valid JSON
        const transfer : Deploy = this.casperClient.deployFromJson(parsedJson).unwrap();
        expect(transfer).to.not.be.null;
        this.contextMap.put("transfer", transfer);
    }

    @then(/^a valid transfer deploy is created$/)
    public aValidTransferDeployIsCreated() {
        console.info("Then a valid transfer deploy is created");

        /*  Deploy transfer = getDeploy();
         assertThat(transfer, is(notNullValue()));*/
    }

    @then(/^the deploy hash is "([^"]*)"$/)
    public theDeployHashIs(hash: string) {
        /* assertThat(getDeploy().getHash().toString(), is(hash));*/
    }

    @then(/^the account is "([^"]*)"$/)
    public theAccountIs(account: string) {
        //  assertThat(getDeploy().getHeader().getAccount().getAlgoTaggedHex(), is(account));
    }

    @then(/^the timestamp is "([^"]*)"$/)
    public theTimestampIs(timestamp: string) {
        //  assertThat(getDeploy().getHeader().getTimeStamp(), is(new DateTime(timestamp).toDate()));
    }

    @then(/^the ttl is (\d+)m$/)
    public theTtlIsM(ttl: number) {
        //  assertThat(getDeploy().getHeader().getTtl().getTtl(), is(Ttl.builder().ttl(ttl + "m").build().getTtl()));
    }

    @then(/^the gas price is (\d+)$/)
    public theGasPriceIs(gasPrice: number) {
        // assertThat(getDeploy().getHeader().getGasPrice(), is(gasPrice));
    }

    @then(/^the body_hash is "([^"]*)"$/)
    public theBody_hashIs(bodyHash: string) {
        // assertThat(getDeploy().getHeader().getBodyHash().toString(), is(bodyHash));
    }

    @then(/^the chain name is "([^"]*)"$/)
    public theChainNameIs(chainName: string) {
        //  assertThat(getDeploy().getHeader().getChainName(), is(chainName));
    }

    @then(/^dependency (\d+) is "([^"]*)"$/)
    public dependencyIs(index: number, hex: string) {
        //  assertThat(getDeploy().getHeader().getDependencies().get(index).toString(), is(hex));
    }

    @then(/^the payment amount is (\d+)$/)
    public thePaymentAmountIs(amount: number) {
        /*  NamedArg<?> payment = getNamedArg(getDeploy().getPayment().getArgs(), "amount");
         assertThat(payment.getClValue(), is(new CLValueU512(BigInteger.valueOf(amount))));*/
    }

    @then(/^the session is a transfer$/)
    public theSessionIsATransfer() {
        //   assertThat(getDeploy().getSession(), is(instanceOf(Transfer.class)));
    }

    @then(/^the session "([^"]*)" is (\d+)$/)
    public theSessionAmountIs(parameterName: string, amount: number) {
        /* NamedArg<?> namedArg = getNamedArg(getDeploy().getSession().getArgs(), parameterName);
        assertThat(namedArg.getClValue(), is(new CLValueU512(BigInteger.valueOf(amount))));*/
    }

    @then(/^the deploy has (\d+) approval$/)
    public theDeployHasApproval(approvalSize: number) {
        // assertThat(getDeploy().getApprovals(), hasSize(approvalSize));
    }

    @then(/^the approval signer is "([^"]*)"$/)
    public theApprovalSignerIs(signer: number) {
        // assertThat(getDeploy().getApprovals().get(0).getSigner().toString(), is(signer));
    }

    @then(/^the approval signature is "([^"]*)"$/)
    public theApprovalSignatureIs(signature: number) {
        // assertThat(getDeploy().getApprovals().get(0).getSignature().getAlgoTaggedHex(), is(signature));
    }

    @then(/^the session "([^"]*)" bytes is "([^"]*)"$/)
    public theSessionAmountBytesIs(parameterName: string, bytes: string) {
        /*  NamedArg<?> amount = getNamedArg(getDeploy().getSession().getArgs(), parameterName);
          AbstractCLValue<?, ?> clValue = amount.getClValue();
         // TODO check why this is different
         assertThat(clValue.getBytes() + (clValue.getClType().getTypeName().equals("U64") ? "00" : ""), is(bytes));*/
    }

    @then(/^the session "([^"]*)" parsed is "([^"]*)"$/)
    public theSessionAmountParsedIs(parameterName: string, parsed: string) {
        /* NamedArg<?> amount = getNamedArg(getDeploy().getSession().getArgs(), parameterName);
         AbstractCLValue<?, ?> clValue = amount.getClValue();

         Object parsedVal = clValue.getParsed();
        if (parsedVal instanceof Integer) {
            assertThat(parsedVal, is(Integer.parseInt(parsed)));
        } else {
            assertThat(parsedVal, is(parsed));
        }*/
    }

    @then(/^the session "([^"]*)" type is "([^"]*)"$/)
    public theSessionTypeIs(parameterName: string, typeName: string) {
        /*   NamedArg<?> amount = getNamedArg(getDeploy().getSession().getArgs(), parameterName);
           AbstractCLValue<?, ?> clValue = amount.getClValue();
          assertThat(clValue.getClType().getTypeName(), is(typeName));*/
    }

    @then(/^the session "([^"]*)" is "([^"]*)"$/)
    public theSessionIs(parameterName: string, value: string) {
        /*  NamedArg<?> amount = getNamedArg(getDeploy().getSession().getArgs(), parameterName);
          AbstractCLValue<?, ?> clValue = amount.getClValue();
         if (clValue.getValue() instanceof byte[]) {
             assertThat(clValue.getValue(), is(Hex.decode(value)));
         } else {
             assertThat(clValue.getValue().toString(), is(value));
         }*/
    }


    private getDeploy(): Deploy {
        //  return contextMap.get("transfer");
        return {} as Deploy;
    }


    private getNamedArg(args: [], name: string) {
        /* Optional<NamedArg<?>> namedArg = args.stream().filter(arg -> name.equals(arg.getType())).findFirst();
         assertThat(namedArg.isPresent(), is(true));
         return namedArg.get();*/
    }
}