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

import { WebhookRequestHandler } from "./webhook";

const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFICATION_TOKEN;

const WebhookUpdateRequestHandler =
    () =>
        (body: any) => {
            console.log(body);
            return Promise.resolve("");
        }

export { WebhookRequestHandler } from "./webhook";

export const handler = WebhookRequestHandler({
    appSecret: APP_SECRET,
    verifyToken: VERIFY_TOKEN,
    updateHandler: WebhookUpdateRequestHandler()
});
