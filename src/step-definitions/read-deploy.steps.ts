import {binding, given, then} from "cucumber-tsflow";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";
import {CasperClient, CLOption, CLU64} from "casper-js-sdk";
import {TestParameters} from "../utils/test-parameters";
import {ContextMap} from "../utils/context-map";
import * as fs from "fs";
import {expect} from "chai";
import {BigNumber} from "@ethersproject/bignumber";
import {CLValue} from "casper-js-sdk/dist/lib/CLValue/Abstract";

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

        const buf = fs.readFileSync(`./src/json/${jsonFilename}`);
        expect(buf).to.not.be.undefined;
        const json = "'{'deploy': " + buf.toString() + "}";

        // Log the deploy
        console.info(json);

        const parsedJson: any = {deploy: JSON.parse(buf.toString())};


        // FIXME TS SDK needs fix to allow loading of valid JSON
        const transfer: Deploy = this.casperClient.deployFromJson(parsedJson).unwrap();
        expect(transfer).to.not.be.null;
        this.contextMap.put("transfer", transfer);
    }

    @then(/^a valid transfer deploy is created$/)
    public aValidTransferDeployIsCreated() {
        console.info("Then a valid transfer deploy is created");

        const transfer = this.getDeploy();
        expect(transfer).to.not.be.null;
    }

    @then(/^the deploy hash is "([^"]*)"$/)
    public theDeployHashIs(hash: string) {
        const expected = Uint8Array.from(Buffer.from(hash, 'hex'));
        const actual = this.getDeploy().hash;
        expect(actual).to.be.eql(expected);
    }

    @then(/^the account is "([^"]*)"$/)
    public theAccountIs(account: string) {
        expect(this.getDeploy().header.account.toHex().toLowerCase()).to.be.eql(account);
    }

    @then(/^the timestamp is "([^"]*)"$/)
    public theTimestampIs(timestamp: string) {
        expect(this.getDeploy().header.timestamp).to.be.eql(new Date(timestamp).getTime());
    }

    @then(/^the ttl is (\d+)m$/)
    public theTtlIsM(ttl: number) {
        expect(this.getDeploy().header.ttl).to.be.eql((ttl * 60 * 1000));
    }

    @then(/^the gas price is (\d+)$/)
    public theGasPriceIs(gasPrice: number) {
        expect(this.getDeploy().header.gasPrice).to.be.eql(gasPrice);
    }

    @then(/^the body_hash is "([^"]*)"$/)
    public theBody_hashIs(bodyHash: string) {
        const expected = Uint8Array.from(Buffer.from(bodyHash, 'hex'));
        const actual = this.getDeploy().header.bodyHash;
        expect(actual).to.be.eql(expected);
    }

    @then(/^the chain name is "([^"]*)"$/)
    public theChainNameIs(chainName: string) {
        expect(this.getDeploy().header.chainName).to.be.eql(chainName);
    }

    @then(/^dependency (\d+) is "([^"]*)"$/)
    public dependencyIs(index: number, hex: string) {
        const expected = Uint8Array.from(Buffer.from(hex, 'hex'));
        expect(this.getDeploy().header.dependencies[index]).to.be.eql(expected);
    }

    @then(/^the payment amount is (\d+)$/)
    public thePaymentAmountIs(amount: number) {
        expect(this.getDeploy().payment.getArgByName("amount")?.value()).to.be.eql(BigNumber.from(amount));
    }

    @then(/^the session is a transfer$/)
    public theSessionIsATransfer() {
        expect(this.getDeploy().session.transfer).to.be.not.null
    }

    @then(/^the session "([^"]*)" is (\d+)$/)
    public theSessionAmountIs(parameterName: string, amount: number) {
        expect(this.getDeploy().session.transfer?.getArgByName(parameterName)?.value()).to.be.eql(BigNumber.from(amount));
    }

    @then(/^the deploy has (\d+) approval$/)
    public theDeployHasApproval(approvalSize: number) {
        expect(this.getDeploy().approvals.length).to.be.eql(approvalSize);
    }

    @then(/^the approval signer is "([^"]*)"$/)
    public theApprovalSignerIs(signer: number) {
        expect(this.getDeploy().approvals[0].signer).to.be.eql(signer);
    }

    @then(/^the approval signature is "([^"]*)"$/)
    public theApprovalSignatureIs(signature: number) {
        expect(this.getDeploy().approvals[0].signature).to.be.eql(signature);
    }

    @then(/^the session "([^"]*)" bytes is "([^"]*)"$/)
    public theSessionAmountBytesIs(parameterName: string, bytes: string) {
        /*  NamedArg<?> amount = getNamedArg(getDeploy().getSession().getArgs(), parameterName);
          AbstractCLValue<?, ?> clValue = amount.getClValue();
         // TODO check why this is different
         assertThat(clValue.getBytes() + (clValue.getClType().getTypeName().equals("U64") ? "00" : ""), is(bytes));*/
        const argByName = this.getDeploy().session.getArgByName(parameterName) as any;
        if (argByName.innerType) {
            //  expect(argByName.innerType.originalBytes).to.be.eql(Uint8Array.from(Buffer.from(bytes + "00", 'hex')));
        } else if (parameterName === 'target') {
            expect(argByName.data).to.be.eql(Uint8Array.from(Buffer.from(bytes.substring(2), 'hex')));
        } else {
            expect(argByName.originalBytes).to.be.eql(Uint8Array.from(Buffer.from(bytes, 'hex')));
        }
    }

    @then(/^the session "([^"]*)" parsed is "([^"]*)"$/)
    public theSessionAmountParsedIs(parameterName: string, parsed: string) {
        // Parsed does not exist for TS code base
    }

    @then(/^the session "([^"]*)" type is "([^"]*)"$/)
    public theSessionTypeIs(parameterName: string, typeName: string) {
        const argByName = this.getDeploy().session.getArgByName(parameterName) as CLValue;
        if ((<any>argByName).innerType) {
            expect((<any>argByName).innerType.linksTo).to.be.eql(typeName);
        } else {
            expect(argByName.clType().toString()).to.be.eql(typeName);
        }
    }

    @then(/^the session "([^"]*)" is "([^"]*)"$/)
    public theSessionIs(parameterName: string, value: string) {
        const argByName = this.getDeploy().session.getArgByName(parameterName) as CLValue;
        if ((<any>argByName).innerType) {
            const option = argByName as CLOption<CLU64>;
            expect((<any>option.value()).val.data).to.be.eql(BigNumber.from(value));
        } else if (parameterName === 'target') {
            expect(argByName.data).to.be.eql(Uint8Array.from(Buffer.from( value.substring(2), 'hex')));
        } else {
            expect(argByName.value().toString()).to.be.eql(value);
        }
    }


    private getDeploy(): Deploy {
        return this.contextMap.get("transfer");
    }
}
