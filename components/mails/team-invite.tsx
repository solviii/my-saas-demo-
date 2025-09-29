import * as React from "react";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
	Tailwind,
} from "@react-email/components";
import { siteConfig } from "@/lib/site";
import { User } from "@prisma/client";

interface InviteEmailTemplateProps {
	inviteLink: string;
	workspace: string;
	inviter: User;
}

export const InviteEmailTemplate: React.FC<Readonly<InviteEmailTemplateProps>> = ({
	inviteLink,
	workspace,
	inviter,
}) => (
	<Html>
		<Head />
		<Preview>
			Join {workspace} on {siteConfig.applicationName}
		</Preview>
		<Tailwind>
			<Body className="bg-white my-auto mx-auto px-2">
				<Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
					<Section className="mt-[32px]">
						<Img
							src={siteConfig.r2.logoUrl}
							width="64"
							height="54"
							alt={siteConfig.applicationName}
							className="my-0 mx-auto"
						/>
					</Section>
					<Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
						Join <strong>{workspace}</strong> on{" "}
						<strong>{siteConfig.applicationName}</strong>
					</Heading>
					<Text className="text-black text-[14px] leading-[24px]">
						<strong>{inviter.name || inviter.email}</strong> (
						<Link
							href={`mailto:${inviter.email}`}
							className="text-blue-600 no-underline"
						>
							{inviter.email}
						</Link>
						) has invited you to the <strong>{workspace}</strong> workspace on{" "}
						<strong>{siteConfig.applicationName}</strong>.
					</Text>
					<Section className="text-center mt-[32px] mb-[32px]">
						<Button
							className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
							href={inviteLink}
						>
							Join Workspace
						</Button>
					</Section>
					<Text className="text-black text-[14px] leading-[24px]">
						or copy and paste this URL into your browser:{" "}
						<Link href={inviteLink} className="text-blue-600 no-underline">
							{inviteLink}
						</Link>
					</Text>
					<Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
					<Text className="text-[#666666] text-[12px] leading-[24px]">
						If you were not expecting this invitation, you can ignore this email. If you
						are concerned about your account&apos;s safety, please reply to this email
						to get in touch with us.
					</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);
export default InviteEmailTemplate;
