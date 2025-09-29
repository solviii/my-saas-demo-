"use server";

import { Prisma } from "@prisma/client";
import BaseServerActionActions from "./base";
import { removeEmptyKeys } from "@/lib/utils";

class BotServerActions extends BaseServerActionActions {
	public static async getModels({ include = {} }: { include?: Prisma.ModelInclude }) {
		return this.executeAction(
			() => this.prisma.model.findMany({ include }),
			"Failed to get models",
		);
	}

	public static async getBots({
		businessId,
		workspaceId = "",
		include = {},
		where = {},
	}: {
		workspaceId?: string;
		businessId: string;
		include?: Prisma.BotInclude;
		where?: Prisma.BotWhereInput;
	}) {
		return this.executeAction(
			() =>
				this.prisma.bot.findMany({
					where: {
						...where,
						business: {
							OR: [{ id: businessId }],
						},
						...(workspaceId
							? { workspace: { OR: [{ id: workspaceId }, { name: workspaceId }] } }
							: {}),
					},
					include,
				}),
			"Failed to get bots",
		);
	}

	public static async retrieveBot({
		botId,
		include = {},
	}: {
		botId: string;
		include?: Prisma.BotInclude;
	}) {
		return this.executeAction(
			() =>
				this.prisma.bot.findUnique({
					where: { id: botId },
					include,
				}),
			"Failed to retrieve bot",
		);
	}

	public static async createBot({
		data,
		include = { workspace: true },
	}: {
		data: Prisma.BotUncheckedCreateInput;
		include?: Prisma.BotInclude;
	}) {
		return this.executeAction(
			() =>
				this.prisma.bot
					.create({
						data: removeEmptyKeys(data),
						include,
					})
					.then((bot) => {
						return {
							bot: bot,
							redirect: `/${bot.workspace.name}/bots/${bot.id}`,
						};
					}),
			"Failed to create bot",
		);
	}

	public static async updateBot({
		botId,
		data,
		include = {},
	}: {
		botId: string;
		data: Prisma.BotUncheckedUpdateInput;
		include?: Prisma.BotInclude;
	}) {
		return this.executeAction(
			() =>
				this.prisma.bot.update({
					where: { id: botId },
					data: data,
					include,
				}),
			"Failed to update bot",
		);
	}

	public static async deleteBot({ botId }: { botId: string }) {
		// :TODO need to check who is deleting the bot
		return this.executeAction(
			() =>
				this.prisma.bot.delete({
					where: {
						id: botId,
					},
				}),
			"Failed deleting bot",
		);
	}
}
export async function getModels(...args: Parameters<typeof BotServerActions.getModels>) {
	return BotServerActions.getModels(...args);
}
export async function getBots(...args: Parameters<typeof BotServerActions.getBots>) {
	return BotServerActions.getBots(...args);
}
export async function retrieveBot(...args: Parameters<typeof BotServerActions.retrieveBot>) {
	return BotServerActions.retrieveBot(...args);
}
export async function createBot(...args: Parameters<typeof BotServerActions.createBot>) {
	return BotServerActions.createBot(...args);
}
export async function updateBot(...args: Parameters<typeof BotServerActions.updateBot>) {
	return BotServerActions.updateBot(...args);
}
export async function deleteBot(...args: Parameters<typeof BotServerActions.deleteBot>) {
	return BotServerActions.deleteBot(...args);
}
export default BotServerActions;
