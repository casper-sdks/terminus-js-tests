import {CasperClient, EventName, EventStream} from "casper-js-sdk";
import {TestParameters} from "./test-parameters";
import {expect} from "chai";

export type CompleteCallback = () => boolean;

export class EventUtils {

    public static async waitForABlockAddedEventWithATimoutOfSeconds(casperClient: CasperClient,
                                                                    deployHash: string,
                                                                    timeout: number): Promise<any> {

        console.info(`wait for a block added event with a timout of ${timeout} seconds for deploy ${deployHash}`);

        const eventSteam: EventStream = new EventStream(TestParameters.getInstance().getEventsBaseUrl() + '/main');

        let awaitedEvent: any = null;
        eventSteam.subscribe(EventName.BlockAdded, event => {
            console.info(JSON.stringify(event.body));
            if (event.body.BlockAdded.block.body.transfer_hashes.length > 0
                && event.body.BlockAdded.block.body.transfer_hashes.includes(deployHash)) {
                console.info("Block added for transfer: " + deployHash);
                awaitedEvent = event;
            }
        });

        eventSteam.start();

        // wait for timeout or a block added for the deployHash is received
        await EventUtils.wait(timeout, () => {
            return awaitedEvent != null;
        });

        eventSteam.unsubscribe(EventName.BlockAdded);
        eventSteam.stop();

        expect(awaitedEvent).to.not.be.null;

        return Promise.resolve(awaitedEvent);
    }

    private static async wait(timeoutSeconds: number, complete: CompleteCallback) {

        const stopTime = new Date().getTime() + (timeoutSeconds * 1000);

        while (new Date().getTime() < stopTime && !complete()) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}