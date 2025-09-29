"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProviderProps } from "next-themes/dist/types";
import { PostHogProvider } from "@/components/providers/posthog";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	return (
		<NextThemesProvider {...themeProps}>
			<Toaster position="bottom-right" richColors />
			<TooltipProvider>
				<PostHogProvider>{children}</PostHogProvider>
			</TooltipProvider>
		</NextThemesProvider>
	);
}
