"use client";
import posthog from "posthog-js";
import { PostHogProvider as BasePostHogProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	const isDev = process.env.NODE_ENV == "development";
	if (typeof window !== "undefined" && !isDev) {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			person_profiles: "identified_only",
		});
	}
	return <BasePostHogProvider client={posthog}>{children}</BasePostHogProvider>;
}
