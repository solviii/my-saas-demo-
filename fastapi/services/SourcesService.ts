/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class SourcesService {
	constructor(public readonly httpRequest: BaseHttpRequest) {}
	/**
	 * Scrape Urls
	 * @param url
	 * @returns any Successful Response
	 * @throws ApiError
	 */
	public scrapeUrls(url: string): CancelablePromise<ScrappedURLS> {
		return this.httpRequest.request({
			method: "GET",
			url: "/api/v1/sources/scrape/urls",
			query: {
				url: url,
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}
	/**
	 * Add Source
	 * @param workspaceId
	 * @param techniqueType
	 * @param requestBody
	 * @param botId
	 * @returns any Successful Response
	 * @throws ApiError
	 */
	public addSource(
		workspaceId: string,
		techniqueType: "website",
		requestBody: Array<string>,
		botId?: string | null,
	): CancelablePromise<AddedSourceResponse> {
		return this.httpRequest.request({
			method: "POST",
			url: "/api/v1/sources/{workspace_id}/add",
			path: {
				workspace_id: workspaceId,
			},
			query: {
				technique_type: techniqueType,
				bot_id: botId,
			},
			body: requestBody,
			mediaType: "application/json",
			errors: {
				422: `Validation Error`,
			},
		});
	}
	/**
	 * Semantic Search
	 * @param workspaceId
	 * @param prompt
	 * @param topK
	 * @returns any Successful Response
	 * @throws ApiError
	 */
	public semanticSearch(
		workspaceId: string,
		prompt: string,
		topK: number = 5,
	): CancelablePromise<any> {
		return this.httpRequest.request({
			method: "GET",
			url: "/api/v1/sources/search/{workspace_id}/semantic",
			path: {
				workspace_id: workspaceId,
			},
			query: {
				prompt: prompt,
				top_k: topK,
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}
}

export interface ScrappedURLS {
	status: string;
	message: string;
	data: string[];
}
export interface AddedSourceResponse {
	status: "success" | "error";
	message: string;
}
