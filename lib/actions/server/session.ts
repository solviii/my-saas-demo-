"use server";
import ms from "ms";
import { DOMAIN } from "@/lib/config";
import { User } from "@prisma/client";
import { userAgent } from "next/server";
import BaseServerActionActions from "./base";
import { redis } from "@/lib/services/redis";
import { cookies, headers } from "next/headers";
import { createCuid } from "@/lib/utils";

class SessionServerActions extends BaseServerActionActions {
	public static authCookieKey = "auth.session.token";
	public static headlessSessionCookieKey = "headless.session.id";

	public static async createSession({ user }: { user: User }) {
		const sessionToken = await this.generateToken();

		await this.prisma.$transaction(async (tx) => {
			const activeSessions = await tx.session.findMany({
				where: {
					userId: user.id,
					status: "ACTIVE",
				},
				orderBy: { createdAt: "desc" },
				take: 5,
			});

			if (activeSessions.length >= 5) {
				await tx.session.update({
					where: { id: activeSessions[activeSessions.length - 1].id },
					data: { status: "INACTIVE" },
				});
			}

			const metadata = this.getUserAgentMetadata();
			await tx.session.create({
				data: {
					userId: user.id,
					sessionToken: sessionToken,
					...metadata,
				},
			});
		});

		if (process.env.USE_REDIS == "1") {
			await redis.set(`user:${sessionToken}`, JSON.stringify(user), {
				EX: ms(process.env.SESSION_EXPIRATION ?? "5d") / 1000,
			});
		}

		return {
			sessionToken,
			expiresAt: new Date(Date.now() + ms(process.env.SESSION_EXPIRATION ?? "5d")),
		};
	}

	public static setSessionTokenCookie({ sessionToken }: { sessionToken: string }) {
		const rootDomain = process.env.NODE_ENV === "development" ? ".app.localhost" : `.${DOMAIN}`;
		cookies().set(this.authCookieKey, sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			domain: rootDomain,
			sameSite: "lax",
			expires: new Date(Date.now() + ms(process.env.SESSION_EXPIRATION ?? "5d")),
		});
	}

	public static async checkSession({ defaultSessionToken }: { defaultSessionToken?: string }) {
		return this.executeAction(async () => {
			const sessionToken =
				defaultSessionToken ?? cookies().get(this.authCookieKey)?.value ?? "";

			if (process.env.USE_REDIS == "1") {
				const cachedUser = await redis.get(`user:${sessionToken}`);
				if (cachedUser) {
					return {
						user: JSON.parse(cachedUser) as User,
					};
				}
			}

			if (!sessionToken) throw new Error("NO_SESSION_TOKEN");

			const session = await this.prisma.$transaction(async (tx) => {
				const currentSession = await tx.session.findFirst({
					where: {
						AND: [{ sessionToken }, { status: "ACTIVE" }],
					},
					select: {
						id: true,
						user: true,
						expiresAt: true,
					},
				});

				if (!currentSession) return null;
				this.updateSession({ currentSession, sessionToken });
				return currentSession;
			});

			if (!session) throw new Error("SESSION_NOT_FOUND");

			return session;
		}, "SESSION_VALIDATION_FAILED");
	}

	private static updateSession = async ({
		currentSession,
		sessionToken,
	}: {
		currentSession: { id: string; expiresAt: Date };
		sessionToken: string;
	}) => {
		if (currentSession.expiresAt < new Date()) {
			await this.prisma.session.update({
				where: { id: currentSession.id },
				data: {
					expiresAt: new Date(Date.now() + ms(process.env.SESSION_EXPIRATION ?? "5d")),
				},
			});
			this.setSessionTokenCookie({ sessionToken });
		}
	};

	public static getUserAgentMetadata = () => {
		const headersList = headers();
		const agent = userAgent({ headers: headersList });
		return {
			os: agent.os.name,
			status: "ACTIVE",
			device: agent.device.type,
			browser: agent.browser.name,
			expiresAt: new Date(Date.now() + ms(process.env.SESSION_EXPIRATION ?? "5d")),
			ipAddress:
				headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown",
		};
	};

	private static async generateToken() {
		const token = crypto.randomUUID();
		const encoder = new TextEncoder();
		const data = encoder.encode(token);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	}

	public static getOrCreateHeadlessSessionId = async () => {
		const cookieStore = cookies();
		const sessionId = cookieStore.get(this.headlessSessionCookieKey)?.value;

		if (sessionId) {
			return sessionId;
		}
		const newSessionId = createCuid();
		cookieStore.set(this.headlessSessionCookieKey, newSessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60,
		});

		return newSessionId;
	};
}

export default SessionServerActions;
