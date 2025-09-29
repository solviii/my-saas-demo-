"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { WorkspaceLink } from "@/app/(app)/(workspace)/components/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/app/(app)/contexts/workspace-context";
import React from "react";

type NavItem =
	| {
			title: string;
			url: string;
			icon?: LucideIcon;
			isActive?: boolean;
			isolate?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
	  }
	| {
			separatedItems: {
				label: string;
				items: {
					title: string;
					url: string;
					icon: LucideIcon;
				}[];
			};
	  };

export function NavMain({ items, title = "Platform" }: { items: NavItem[]; title?: string }) {
	const { workspace } = useWorkspace();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item, index) => {
					if ("separatedItems" in item) {
						return (
							<React.Fragment key={`separated-${index}`}>
								<span className="text-xs text-muted-foreground pl-2 pt-4">
									{item.separatedItems.label}
								</span>
								<SidebarSeparator />
								{item.separatedItems.items.map((separatedItem) => (
									<SidebarMenuItem key={separatedItem.title}>
										<SidebarMenuButton
											className={cn(
												separatedItem.url == "#" && "text-muted-foreground",
											)}
											tooltip={separatedItem.title}
											asChild
										>
											<WorkspaceLink href={separatedItem.url}>
												{separatedItem.icon && <separatedItem.icon />}
												<span>{separatedItem.title}</span>
											</WorkspaceLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</React.Fragment>
						);
					}

					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={item.isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								{item.items ? (
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
								) : (
									<SidebarMenuButton
										className={cn(item.url == "#" && "text-muted-foreground")}
										tooltip={item.title}
										asChild
									>
										{!item.isolate ? (
											<WorkspaceLink href={item.url}>
												{item.icon && <item.icon />}
												<span>{item.title}</span>
												{item.items && (
													<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
												)}
											</WorkspaceLink>
										) : (
											<a href={item.url}>
												{item.icon && <item.icon />}
												<span>{item.title}</span>
												{item.items && (
													<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
												)}
											</a>
										)}
									</SidebarMenuButton>
								)}
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton asChild>
													<WorkspaceLink href={subItem.url}>
														<span>{subItem.title}</span>
													</WorkspaceLink>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
