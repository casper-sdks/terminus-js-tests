import * as http from "http";

export class SimpleRcpClient {

    public constructor(private hostname: string, private port: number) {

    }

    /**
     * Obtains auction info as a JsonNode by block hash
     *
     * @param hash the block to obtain auction info for
     * @return the Json result
     * @throws Exception if an IO error occurs
     */
    public async getAuctionInfoByHash(hash: string): Promise<any> {
        //return this.curl("state_get_auction_info", "[{\"Hash\":  \"" + hash + "\"}]");
        return this.rpc("state_get_auction_info", "[{\"Hash\":  \"" + hash + "\"}]");
    }

    private async rpc(method: string, params: string): Promise<any> {

        const payload = "{\"id\":\"" + new Date().getTime() + "\",\"jsonrpc\":\"2.0\",\"method\":\"" + method + "\",\"params\":" + params + "}";

        const options = {
            hostname: this.hostname,
            port: this.port,
            path: '/rpc',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        let parsedData: any;

        return new Promise((resolve, reject) => {

            const req = http.request(options, res => {
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => {
                    rawData += chunk;
                });
                res.on('end', () => {
                    try {
                        parsedData = JSON.parse(rawData);
                        console.log(parsedData);
                        resolve(parsedData);
                    } catch (e) {
                        console.error(e);
                        reject(e);
                    }
                });
            });
            req.write(payload);
            req.end();
        });
    }


}
