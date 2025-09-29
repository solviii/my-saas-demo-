"use client";
import React from "react";
import { toast } from "sonner";
import { Bot } from "@prisma/client";
import { Button } from "./ui/button";
import { siteConfig } from "@/lib/site";

export const shareBot = async (bot: Bot) => {
	if (typeof window !== "undefined") {
		const shareData = {
			title: bot
				? `Try ${bot.name} - ${siteConfig.applicationName}`
				: `${siteConfig.applicationName}`,
			url: `${siteConfig.domains.root}/chats/${bot?.id}`,
		};
		try {
			await window.navigator.share(shareData);
		} catch (error) {
			try {
				await window.navigator.clipboard
					.writeText(shareData.url)
					.then(() => toast.success("Bot link copied to clipboard"));
			} catch (error) {
				toast.error("Error sharing or copying the bot link");
			}
		}
	}
};

export default function ShareButton({ bot, disabled = false }: { bot: Bot; disabled?: boolean }) {
	return (
		<Button disabled={disabled} onClick={() => shareBot(bot)} variant={"ringHover"}>
			Click to share your Bot
		</Button>
	);
}
