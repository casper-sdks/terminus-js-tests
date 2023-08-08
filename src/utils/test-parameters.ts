/**
 * Processes the command line to obtain default overrides for host and port names.
 */
export class TestParameters {

    private static DEFAULT_HOST = 'localhost';
    private static DEFAULT_RCP_PORT = '11101';
    private static DEFAULT_REST_PORT = '1401';
    private static DEFAULT_SSE_PORT = '18101';
    private static DEFAULT_DOCKER_NAME = 'cspr-nctl';
    private static instance = new TestParameters();
    private hostname = TestParameters.DEFAULT_HOST
    private _dockerName = TestParameters.DEFAULT_DOCKER_NAME;
    private rcpPort = TestParameters.DEFAULT_RCP_PORT;
    private restPort = TestParameters.DEFAULT_REST_PORT;
    private ssePort = TestParameters.DEFAULT_SSE_PORT;

    private constructor() {
        // noinspection JSUnusedLocalSymbols
        process.argv.forEach((val: string, index: number) => {

            if (val.startsWith("cspr.")) {
                this.processArgv(val);
            }
        });
    }

    public static getInstance(): TestParameters {
        return TestParameters.instance;
    }

    public getRcpUrl(): string {
        // noinspection HttpUrlsUsage
        return 'http://' + this.hostname + ':' + this.rcpPort + '/rpc';
    }

    public getEventsBaseUrl() {
        return 'http://' + this.hostname + ':' + this.ssePort + '/events';
    }


    public get dockerName(): string {
        return this._dockerName;
    }

    private processArgv(argVal: string): void {
        const split = argVal.split("=");
        const arg = split[0];
        const val = split[1];

        console.log(argVal);

        switch (arg) {
            case 'cspr.hostname':
                this.hostname = val;
                break;
            case 'cspr.dockername':
                this._dockerName = val;
                break;
            case 'cspr.port.rcp':
                this.rcpPort = val;
                break;
            case 'cspr.port.rest':
                this.restPort = val;
                break;
            case 'cspr.port.sse':
                this.ssePort = val;
                break;
        }
    }

    public getHostname(): string {
        return this.hostname;
    }

    public getRcpPort(): number {
        return +this.rcpPort;
    }
}
