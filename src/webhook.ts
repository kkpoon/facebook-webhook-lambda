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
import { SignatureVerifier, VerificationRequestHandler } from "./verifier";

export interface WebhookHandlerOptions {
    appSecret: string;
    verifyToken: string;
    updateHandler: (body: any) => Promise<string>;
}

export const WebhookRequestHandler = (options: WebhookHandlerOptions) => {
    const verifySignature =
        SignatureVerifier(options.appSecret);
    const handleVerificationRequest =
        VerificationRequestHandler(options.verifyToken);
    const handleWebhookUpdateRequest =
        options.updateHandler;

    return (event: APIGatewayEvent, context: Context, callback: ProxyCallback) => {
        const { body, httpMethod, headers, queryStringParameters } = event;
        const signature = headers["X-Hub-Signature"];
        const processRequest = (() => {
            switch (httpMethod) {
                case "GET":
                    return handleVerificationRequest({
                        mode: queryStringParameters["hub.mode"],
                        challenge: queryStringParameters["hub.challenge"],
                        verify_token: queryStringParameters["hub.verify_token"]
                    });
                case "POST":
                    return verifySignature(signature)(body)
                        .then(() => handleWebhookUpdateRequest(body));
                default:
                    return Promise.reject("unknown request");
            }
        })();

        return processRequest.then(
            (resBody) => callback(null, { statusCode: 200, body: resBody }),
            (err) => {
                console.error("ERROR: " + err);
                callback(null, { statusCode: 500, body: err })
            }
        );
    };
};
