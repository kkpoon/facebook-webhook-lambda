/*
 * Copyright 2017 kkpoon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { APIGatewayEvent, Context, ProxyCallback } from "aws-lambda";
import { SignatureVerifier, TokenVerifier } from "./verifier";

export interface WebhookHandlerOptions {
    appSecret: string;
    verifyToken: string;
    updateHandler: (body: any) => Promise<string>;
}

export const WebhookRequestHandler = (options: WebhookHandlerOptions) => {
    const verifySignature = SignatureVerifier(options.appSecret);
    const verityToken = TokenVerifier(options.verifyToken);
    const handleUpdate = options.updateHandler;

    return (event: APIGatewayEvent, context: Context, callback: ProxyCallback) => {
        const { body, httpMethod, headers, queryStringParameters } = event;
        const signature = headers["X-Hub-Signature"];
        const handleRequest = (() => {
            switch (httpMethod) {
                case "GET":
                    return verityToken(queryStringParameters["hub.verify_token"])
                        .then(() => queryStringParameters["hub.challenge"]);
                case "POST":
                    return verifySignature(signature)(body)
                        .then(() => handleUpdate(JSON.parse(body)));
                default:
                    return Promise.reject("unknown request");
            }
        })();

        return handleRequest.then(
            (resBody) => callback(null, { statusCode: 200, body: resBody }),
            (err) => {
                console.error("ERROR: " + err);
                callback(null, { statusCode: 500, body: err })
            }
        );
    };
};
