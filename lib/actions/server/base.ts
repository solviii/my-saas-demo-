"use server";

import { debug } from "@/lib/utils";
import { prisma } from "@/lib/services/prisma";
import { Prisma, PrismaClient } from "@prisma/client";
type ActionResponse<T> = {
	success: boolean;
	data: T;
	error: string;
};

abstract class BaseServerActionActions {
	protected static prisma: PrismaClient = prisma;

	protected static async executeAction<T>(
		action: () => Promise<T>,
		errorMessage: string,
		onError?: (err: any) => void,
	): Promise<ActionResponse<T>> {
		const actionName = this.getCallerFunctionName();
		debug("SERVER", actionName, "PRISMA ACTIONS");
		try {
			const result = await action();
			return { success: true, data: result, error: null as unknown as string };
		} catch (error) {
			const isPrismaError = /prisma|database|connection|constraint/i.test(String(error));
			const newErrorMessage = isPrismaError
				? "Internal server error"
				: error instanceof Error
					? error.message
					: errorMessage;
			if (onError) onError(error);
			return { success: false, data: null as T, error: newErrorMessage };
		}
	}
	protected static getCallerFunctionName(): string {
		const stack = `${new Error().stack}`;
		const callerLine = stack?.split("\n")[3];
		const functionName = callerLine?.match(/at\s+(.*?)\s+\(/)?.[1] ?? "unknown";
		return functionName.split(".").pop() ?? "unknown";
	}
}
export default BaseServerActionActions;
