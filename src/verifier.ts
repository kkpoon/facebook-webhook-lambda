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

import * as crypto from "crypto";

export const SignatureVerifier =
    (secret: string) => (signature: string) => (payload: string) =>
        new Promise((resolve, reject) => {
            if (!signature) {
                return reject("Couldn't validate the signature.");
            } else {
                let elements = signature.split('=');
                let method = elements[0];
                let signatureHash = elements[1];

                let expectedHash = crypto
                    .createHmac('sha1', secret)
                    .update(payload)
                    .digest('hex');

                if (signatureHash != expectedHash) {
                    return reject("Couldn't validate the request signature.");
                }
            }
            return resolve();
        });

export interface VerificationData {
    mode: string;
    challenge: string;
    verify_token: string;
}

export const VerificationRequestHandler =
    (expectedVerifyToken: string) =>
        (data: VerificationData) =>
            expectedVerifyToken === data.verify_token ?
                Promise.resolve(data.challenge)
                : Promise.reject("invalid verify token");
