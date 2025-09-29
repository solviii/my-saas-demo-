"use server";

import { ChatFeedback, Prisma } from "@prisma/client";
import BaseServerActionActions from "./base";
import { headers } from "next/headers";
import SessionServerActions from "./session";

class ChatServerActions extends BaseServerActionActions {
	public static async getChats({ conversationId }: { conversationId: string }) {
		return this.executeAction(async () => {
			const chats = await this.prisma.chat.findMany({
				where: {
					conversationId: conversationId,
					content: {
						not: {
							equals: "",
						},
					},
				},
				orderBy: { createdAt: "asc" },
			});
			return chats.filter((chat) => ["assistant", "user"].includes(chat.role));
		}, "Failed to get chats");
	}
	public static async addFeedback({
		chatId,
		feedback,
	}: {
		chatId: string;
		feedback: ChatFeedback;
	}) {
		return this.executeAction(async () => {
			await this.prisma.chat.update({
				where: {
					id: chatId,
				},
				data: {
					feedback: feedback,
				},
			});
		}, "Failed to add feedback");
	}
	public static async getConversations({
		botId,
		include = {
			chats: {
				select: { id: true },
			},
		},
	}: {
		botId: string;
		include?: Prisma.ConversationInclude;
	}) {
		return this.executeAction(
			() =>
				this.prisma.conversation.findMany({
					where: {
						botId: botId,
					},
					orderBy: { updatedAt: "desc" },
					include,
				}),
			"Failed to get chats",
		);
	}

	public static async createConversation({ botId }: { botId: string }) {
		const sessionId = await SessionServerActions.getOrCreateHeadlessSessionId();
		return this.executeAction(async () => {
			const bot = await this.prisma.bot.findUnique({
				where: { id: botId },
			});
			if (!bot) {
				return null;
			}
			return this.prisma.conversation.create({
				data: {
					botId,
					sessionId,
					countryCode: headers().get("CF-IPCountry") || null,
				},
				include: { bot: true },
			});
		}, "Failed creating conversation");
	}
	public static async retrieveOrCreateConversation({ botId }: { botId: string }) {
		const sessionId = await SessionServerActions.getOrCreateHeadlessSessionId();
		return this.executeAction(async () => {
			const existingConversation = await this.prisma.conversation.findFirst({
				where: {
					botId,
					sessionId,
				},
				orderBy: { createdAt: "desc" },
				include: { bot: true },
			});
			if (existingConversation) {
				return existingConversation;
			}

			const { data: conversation, success, error } = await this.createConversation({ botId });
			if (!success) {
				throw new Error(error);
			}
			return conversation;
		}, "Failed retrieving or creating conversation");
	}
}

export async function getChats(...args: Parameters<typeof ChatServerActions.getChats>) {
	return ChatServerActions.getChats(...args);
}
export async function getConversations(
	...args: Parameters<typeof ChatServerActions.getConversations>
) {
	return ChatServerActions.getConversations(...args);
}
export async function createConversation(
	...args: Parameters<typeof ChatServerActions.createConversation>
) {
	return ChatServerActions.createConversation(...args);
}
export async function retrieveOrCreateConversation(
	...args: Parameters<typeof ChatServerActions.retrieveOrCreateConversation>
) {
	return ChatServerActions.retrieveOrCreateConversation(...args);
}
export async function addFeedback(...args: Parameters<typeof ChatServerActions.addFeedback>) {
	return ChatServerActions.addFeedback(...args);
}
export default ChatServerActions;
