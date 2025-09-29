"use client";

import { Building, MoreHorizontal } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { useWorkspace } from "@/app/(app)/contexts/workspace-context";
import { WorkspaceLink } from "@/app/(app)/(workspace)/components/link";

export function NavBusinesses() {
	const { workspace, isLoading } = useWorkspace();

	if ((workspace?.businesses || []).length == 0 && !isLoading) return null;
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Businesses</SidebarGroupLabel>
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
						{workspace?.businesses?.slice(0, 3).map((business) => (
							<SidebarMenuItem key={business.id}>
								<SidebarMenuButton asChild>
									<WorkspaceLink href={`/businesses/${business.id}`}>
										<Building />
										<span>{business.name}</span>
									</WorkspaceLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</>
				)}
				{(workspace?.businesses || []).length > 3 && (
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
