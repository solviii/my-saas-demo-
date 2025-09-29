/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from "./core/BaseHttpRequest";
import type { OpenAPIConfig } from "./core/OpenAPI";
import { FetchHttpRequest } from "./core/FetchHttpRequest";
import { ChatService } from "./services/ChatService";
import { SourcesService } from "./services/SourcesService";
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
	public readonly chat: ChatService;
	public readonly sources: SourcesService;
	public readonly request: BaseHttpRequest;
	constructor(
		config?: Partial<OpenAPIConfig>,
		HttpRequest: HttpRequestConstructor = FetchHttpRequest,
	) {
		this.request = new HttpRequest({
			BASE: config?.BASE ?? "",
			VERSION: config?.VERSION ?? "1.0.0",
			WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
			CREDENTIALS: config?.CREDENTIALS ?? "include",
			TOKEN: config?.TOKEN,
			USERNAME: config?.USERNAME,
			PASSWORD: config?.PASSWORD,
			HEADERS: config?.HEADERS,
			ENCODE_PATH: config?.ENCODE_PATH,
		});
		this.chat = new ChatService(this.request);
		this.sources = new SourcesService(this.request);
	}
}
