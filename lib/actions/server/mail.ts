import { debug } from "@/lib/utils";
import { User } from "@prisma/client";
import { InviteEmailTemplate } from "@/components/mails/team-invite";
import resendClient, { RESEND_CONFIG } from "@/lib/services/resend";
import { CreateBatchOptions } from "resend";

export async function sendWorkspaceInvitationMail(
	emails: string[],
	workspaceId: string,
	displayName: string,
	inviter: User,
) {
	debug("SERVER", "sendWorkspaceInvitation", "PRISMA ACTIONS");
	const teamMembersEmails: CreateBatchOptions = emails.map((email) => {
		return {
			from: `${RESEND_CONFIG.fromName} <${RESEND_CONFIG.fromEmail}>`,
			to: email,
			subject: `Invitation to join ${displayName}`,
			react: InviteEmailTemplate({
				inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/invitations/${workspaceId}`,
				workspace: displayName,
				inviter: inviter,
			}),
		};
	});
	resendClient.batch.send(teamMembersEmails);
}
