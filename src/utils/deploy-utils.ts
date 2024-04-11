import {BigNumber} from "@ethersproject/bignumber";
import {CasperClient, DeployUtil, JsonDeploy, Keys, NamedArg} from "casper-js-sdk";
import {expect} from "chai";
import {TestParameters} from "./test-parameters";
import {Deploy} from "casper-js-sdk/dist/lib/DeployUtil";

export class DeployUtils {

    static buildStandardTransferDeploy(casperClient: CasperClient, namedArgs: Array<NamedArg>): DeployUtil.Deploy {
        const amount = BigNumber.from('2500000000');
        const senderKeyPair = casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-1/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        const receiverKeyPair = casperClient.loadKeyPairFromPrivateFile(`./assets/net-1/user-2/secret_key.pem`, Keys.SignatureAlgorithm.Ed25519);
        return DeployUtils.buildStandardTransferOfAmountDeploy(casperClient, senderKeyPair, receiverKeyPair, amount, namedArgs);
    }

    static buildStandardTransferOfAmountDeploy(casperClient: CasperClient,
                                               senderKeyPair: Keys.AsymmetricKey,
                                               receiverKeyPair: Keys.AsymmetricKey,
                                               amount: BigNumber,
                                               namedArgs: Array<NamedArg>): DeployUtil.Deploy {

        const id = BigNumber.from(Math.round(Math.random()));
        const gasPrice: number = 1;
        const ttl = DeployUtil.dehumanizerTTL('30m');

        const transfer = DeployUtil.ExecutableDeployItem.newTransfer(amount, receiverKeyPair.publicKey, undefined, id);
        expect(transfer).to.not.be.undefined;

        namedArgs.forEach(namedArg => {
            transfer.transfer?.args.insert(namedArg.name, namedArg.value);
        });

        const standardPayment = DeployUtil.standardPayment(BigNumber.from(100000000));
        expect(standardPayment).to.not.be.undefined;

        const deployParams = new DeployUtil.DeployParams(senderKeyPair.publicKey, TestParameters.getInstance().getChainName, gasPrice, ttl);
        const deploy = DeployUtil.makeDeploy(deployParams, transfer, standardPayment);

        casperClient.signDeploy(deploy, senderKeyPair);

        return deploy;
    }

    public static getNamedArgument(deploy: JsonDeploy, name: string): any {
        let args: [] = (deploy.session.Transfer as any).args;
        let arg: any = args.find(arg => arg[0] == name);
        expect(arg).to.not.be.undefined;
        return arg;
    }

    public static getDeployNamedArgument(deploy: Deploy, name: string): any {
        return deploy.session.transfer?.getArgByName(name);
    }
}
