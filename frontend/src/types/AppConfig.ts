/*
 * Copyright 2026 Joao Vicente
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

export type AppConfig = {
    // Service URLs dynamically mapped by name
    services?: Record<string, string>;
    // Feature flags, branding, etc.
    features?: Record<string, boolean>;
    // Navigation config loaded from yaml
    navigation?: any;
    // Auth settings
    auth?: {
        provider: string;
        logoutUrl?: string;
    };
    [key: string]: any;
};
