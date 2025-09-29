"use server";
import { Prisma, User, Workspace, WorkspaceInviteStatus } from "@prisma/client";
import BaseServerActionActions from "./base";
import { sendWorkspaceInvitationMail } from "./mail";
import { z } from "zod";
import { initializeWorkspaceSchema } from "@/lib/zod";
import AuthServerActions from "./auth";
import { generateUniqueName } from "./prisma";
import ms from "ms";
import { addMonths } from "date-fns";

class WorkspaceServerActions extends BaseServerActionActions {
	public static async getWorkspaces({
		userId,
		include = { workspace: true },
	}: {
		userId: string;
		include?: Prisma.WorkspaceMembershipInclude;
	}) {
		return this.executeAction(async () => {
			const workspaces = await this.prisma.workspaceMembership.findMany({
				where: {
					userId: userId,
				},
				include,
			});
			return workspaces.map((ws) => ws.workspace);
		}, "Failed to get workspaces");
	}

	public static async retrieveWorkspace({
		workspaceId,
		include = {
			bots: true,
			businesses: true,
			payments: true,
			subscription: {
				include: {
					plan: true,
				},
			},
			vectors: true,
			users: true,
			invitations: true,
			owner: true,
		},
	}: {
		workspaceId: string;
		include: Prisma.WorkspaceInclude;
	}) {
		return this.executeAction(
			async () =>
				this.prisma.workspace.findFirst({
					where: {
						OR: [{ name: workspaceId }, { id: workspaceId }],
					},
					include,
				}),
			"Failed to retrieve workspace",
		);
	}

	public static async createWorkspace({
		data,
		include = {},
	}: {
		data: Prisma.WorkspaceUncheckedCreateInput;
		include?: Prisma.WorkspaceInclude;
	}) {
		return this.executeAction(
			() =>
				this.prisma.workspace.create({
					data: {
						...data,
						subscription: {
							create: {
								status: "ACTIVE",
								startDate: new Date(),
								endDate: addMonths(new Date(), 1),
								billingCycle: "MONTHLY",
								plan: {
									connect: {
										name: "free",
									},
								},
							},
						},
					},
					include,
				}),
			"Failed to create workspace",
		);
	}

	public static async updateWorkspace({
		id,
		data,
	}: {
		id: string;
		data: Prisma.WorkspaceUncheckedUpdateInput;
	}) {
		return this.executeAction(
			() =>
				this.prisma.workspace.update({
					where: { id },
					data,
				}),
			"Failed to update workspace",
		);
	}

	// EXTRA
	public static async initializeWorkspace({
		data,
	}: {
		data: z.infer<typeof initializeWorkspaceSchema>;
	}) {
		const { data: user } = await AuthServerActions.authUser();
		if (!user) throw new Error("Not Authenticated to perform this action");

		const parsedData = initializeWorkspaceSchema.parse(data);
		const uniqueName = await generateUniqueName(parsedData.displayName, "workspace");

		return this.executeAction(async () => {
			const {
				data: workspace,
				success,
				error,
			} = await this.createWorkspace({
				data: {
					displayName: data.displayName,
					name: uniqueName,
					ownerId: user.id,
				},
				include: {
					owner: true,
				},
			});
			if (!success) throw new Error(error);

			const { error: MembershipError, success: MembershipSuccess } =
				await this.createWorkspaceMembership({
					workspaceId: workspace.id,
					userId: user.id,
				});

			if (!MembershipSuccess) throw new Error(MembershipError);
			const members = parsedData.team.map((member) => {
				return {
					email: member.email,
					roleId: member.roleId,
					workspaceId: workspace.id,
					status: WorkspaceInviteStatus.PENDING,
				};
			});
			if (members.length > 0) {
				const { error: InvitationError, success: InvitationSuccess } =
					await this.createWorkspaceInvitation({ members, workspace });
				if (!InvitationSuccess) {
					throw new Error(InvitationError);
				}
			}
			return workspace;
		}, "Failed to initialize the workspace");
	}
	public static async createWorkspaceMembership({
		workspaceId,
		userId,
	}: {
		workspaceId: string;
		userId: string;
	}) {
		return this.executeAction(
			() =>
				this.prisma.workspaceMembership.create({
					data: {
						workspaceId: workspaceId,
						userId: userId,
					},
				}),
			"Failed to create workspaceMembership",
		);
	}
	public static async createWorkspaceInvitation({
		members,
		workspace,
	}: {
		members: Prisma.WorkspaceInvitationUncheckedCreateInput[];
		workspace: Workspace & { owner: User };
	}) {
		return this.executeAction(async () => {
			await this.prisma.workspaceInvitation.createMany({
				data: members,
			});
			const teamMembersEmails = members.map((member) => member.email);
			try {
				await sendWorkspaceInvitationMail(
					teamMembersEmails,
					workspace.id,
					workspace.displayName,
					workspace.owner,
				);
			} catch (error) {
				throw new Error("Failed to send invitation email");
			}
		}, "Failed to create workspace invitations");
	}

	public static async checkWorkspaceMembership({
		userId,
		workspaceId,
		select = { workspace: true },
	}: {
		userId: string;
		workspaceId: string;
		select?: Prisma.WorkspaceMembershipSelect;
	}) {
		return this.executeAction(async () => {
			const membership = await this.prisma.workspaceMembership.findFirst({
				where: {
					userId: userId,
					workspace: {
						OR: [{ name: workspaceId }, { id: workspaceId }],
					},
				},
				select,
			});
			return {
				status: !!membership,
				workspace: membership?.workspace,
			};
		}, "Failed to check workspace membership");
	}

	public static async getDefaultWorkspace({
		userId,
		select = { workspace: true },
	}: {
		userId: string;
		select?: Prisma.WorkspaceMembershipSelect;
	}) {
		return this.executeAction(async () => {
			const workspaceMembership = await this.prisma.workspaceMembership.findFirst({
				where: {
					userId: userId,
				},
				select,
			});
			return workspaceMembership?.workspace;
		}, "Failed to get default workspace");
	}
}
export async function getWorkspaces(
	...args: Parameters<typeof WorkspaceServerActions.getWorkspaces>
) {
	return WorkspaceServerActions.getWorkspaces(...args);
}

export async function retrieveWorkspace(
	...args: Parameters<typeof WorkspaceServerActions.retrieveWorkspace>
) {
	return WorkspaceServerActions.retrieveWorkspace(...args);
}

export async function createWorkspace(
	...args: Parameters<typeof WorkspaceServerActions.createWorkspace>
) {
	return WorkspaceServerActions.createWorkspace(...args);
}
export async function updateWorkspace(
	...args: Parameters<typeof WorkspaceServerActions.updateWorkspace>
) {
	return WorkspaceServerActions.updateWorkspace(...args);
}
export async function initializeWorkspace(
	...args: Parameters<typeof WorkspaceServerActions.initializeWorkspace>
) {
	return WorkspaceServerActions.initializeWorkspace(...args);
}
export async function createWorkspaceMembership(
	...args: Parameters<typeof WorkspaceServerActions.createWorkspaceMembership>
) {
	return WorkspaceServerActions.createWorkspaceMembership(...args);
}
export async function createWorkspaceInvitation(
	...args: Parameters<typeof WorkspaceServerActions.createWorkspaceInvitation>
) {
	return WorkspaceServerActions.createWorkspaceInvitation(...args);
}

export default WorkspaceServerActions;
