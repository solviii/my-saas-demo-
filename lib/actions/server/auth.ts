"use server";
import { z } from "zod";
import { User } from "@prisma/client";
import { exclude } from "@/lib/utils";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { siteConfig } from "@/lib/site";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import BaseServerActionActions from "./base";
import SessionServerActions from "./session";
import { redis } from "@/lib/services/redis";
import { SignInSchema, SignUpSchema } from "@/lib/zod";
import { NextURL } from "next/dist/server/web/next-url";
import { comparePassword, hashPassword } from "./prisma";
import { DOMAIN } from "@/lib/config";

class AuthServerActions extends BaseServerActionActions {
	public static authCookieKey = "auth.session.token";

	public static async signUp(data: z.infer<typeof SignUpSchema>, skipCheck = false) {
		return this.executeAction(async () => {
			if (!skipCheck) {
				const existingUser = await this.prisma.user.findUnique({
					where: { email: data.email },
				});
				if (existingUser) throw new Error("USER_ALREADY_EXISTS");
			}
			const cleanData = await hashPassword(data);
			const user = await this.prisma.user.create({ data: cleanData });

			return this.authenticate("SIGN_UP", user);
		}, "SIGN_UP_FAILED");
	}

	public static async signIn(data: z.infer<typeof SignInSchema>) {
		return this.executeAction(async () => {
			const user = await this.prisma.user.findUnique({
				where: { email: data.email },
			});

			if (!user) throw new Error("USER_NOT_FOUND");

			const { matched } = await comparePassword(data.password, user.password);

			if (!matched) throw new Error("INVALID_PASSWORD");

			return this.authenticate("SIGN_IN", user);
		}, "SIGN_IN_FAILED");
	}

	public static async signUpOrIn(
		data: z.infer<typeof SignUpSchema> & { id?: string },
		provider?: "GOOGLE" | "GITHUB",
	) {
		return this.executeAction(async () => {
			const user = await this.prisma.user.findUnique({
				where: { email: data.email },
			});

			if (user) {
				if (provider !== "GOOGLE") {
					const { data: signInResponse, success, error } = await this.signIn(data);
					if (!success) throw new Error(error);
					return signInResponse;
				}
				// :TODO Needs some security measures
				return this.authenticate("SIGN_IN", user);
			}
			const { data: signUpResponse, success, error } = await this.signUp(data, true);
			if (!success) throw new Error(error);
			return signUpResponse;
		}, "SIGN_UP_OR_IN_FAILED");
	}

	public static async signOut(returnTo = siteConfig.domains.root) {
		const rootDomain = process.env.NODE_ENV === "development" ? ".app.localhost" : `.${DOMAIN}`;
		cookies().delete({
			name: this.authCookieKey,
			httpOnly: true,
			domain: rootDomain,
		});
		redirect(returnTo);
	}

	private static async authenticate(action: "SIGN_UP" | "SIGN_IN", user: User) {
		const sessionToken = await SessionServerActions.createSession({ user: user });
		SessionServerActions.setSessionTokenCookie({ sessionToken: sessionToken.sessionToken });

		await this.prisma.user.update({
			where: { id: user.id },
			data: { lastLoggedAt: new Date() },
		});

		return {
			action,
			sessionToken,
			user: exclude(user, "password") as User,
		};
	}

	public static async authUser(redirectOnFail = true) {
		return this.executeAction(
			async () => {
				const sessionToken = cookies().get(this.authCookieKey)?.value;
				if (!sessionToken) throw new Error("NO_SESSION_TOKEN");

				if (process.env.USE_REDIS == "1") {
					const cachedUser = await redis.get(`user:${sessionToken}`);
					if (cachedUser) {
						return JSON.parse(cachedUser) as User;
					}
				}

				const session = await this.prisma.session.findFirst({
					where: { sessionToken },
					include: { user: true },
				});

				if (!session) throw new Error("INVALID_SESSION");

				return session.user;
			},
			"AUTH_USER_FAILED",
			(error) => {
				const er = error as Error;
				if (redirectOnFail) {
					this.signOut(`/auth/sign-in?error=AUTH_FAILED&reason=${er.cause}`);
				}
			},
		);
	}

	public static async getRoles(include: Prisma.RoleInclude = {}) {
		return this.executeAction(
			() => this.prisma.role.findMany({ include }),
			"Failed getting roles",
		);
	}
}

export async function authUser(...args: Parameters<typeof AuthServerActions.authUser>) {
	return AuthServerActions.authUser(...args);
}
export async function signIn(...args: Parameters<typeof AuthServerActions.signIn>) {
	return AuthServerActions.signIn(...args);
}

export async function signUp(...args: Parameters<typeof AuthServerActions.signUp>) {
	return AuthServerActions.signUp(...args);
}

export async function signOut(...args: Parameters<typeof AuthServerActions.signOut>) {
	return AuthServerActions.signOut(...args);
}

export async function getRoles(...args: Parameters<typeof AuthServerActions.getRoles>) {
	return AuthServerActions.getRoles(...args);
}

export default AuthServerActions;
