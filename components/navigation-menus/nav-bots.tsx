"use client";

import { Forward, MoreHorizontal, Bot as BotIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { shareBot } from "../share-button";
import { useWorkspace } from "@/app/(app)/contexts/workspace-context";
import { WorkspaceLink } from "@/app/(app)/(workspace)/components/link";
import { Bot } from "@prisma/client";

export function NavBots() {
	const { isMobile } = useSidebar();
	const { workspace, isLoading } = useWorkspace();
	const bots: Bot[] = [];
	workspace?.businesses?.forEach((b) => {
		b.bots.forEach((bot) => {
			bots.push(bot);
		});
	});
	if (bots.length == 0 && !isLoading) return null;
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Bots</SidebarGroupLabel>
			<SidebarMenu>
				{isLoading ? (
					<>
						{Array.from({ length: 2 }).map((_, index) => (
							<SidebarMenuItem key={index}>
								<SidebarMenuButton asChild>
									<div className="flex">
										<Skeleton className="h-6 w-8" />
										<Skeleton className="w-full h-6" />
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</>
				) : (
					<>
						{bots?.slice(0, 3).map((bot) => (
							<SidebarMenuItem key={bot.name}>
								<SidebarMenuButton asChild className="w-full">
									<WorkspaceLink
										href={`businesses/${bot.businessId}/bots/${bot.id}`}
									>
										<BotIcon />
										<span>{bot.name}</span>
									</WorkspaceLink>
								</SidebarMenuButton>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuAction showOnHover>
											<MoreHorizontal />
											<span className="sr-only">More</span>
										</SidebarMenuAction>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-48 rounded-lg"
										side={isMobile ? "bottom" : "right"}
										align={isMobile ? "end" : "start"}
									>
										<DropdownMenuItem onClick={() => shareBot(bot)}>
											<Forward className="text-muted-foreground" />
											<span>Share Bot</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						))}
					</>
				)}
				{bots.length > 3 && (
					<SidebarMenuItem>
						<SidebarMenuButton className="text-sidebar-foreground/70">
							<MoreHorizontal className="text-sidebar-foreground/70" />
							<span>More</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}
