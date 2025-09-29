"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { sidebarData } from "./sidebar-store";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, usePathname } from "next/navigation";
import { NavBusinesses } from "./navigation-menus/nav-business";
import { NavMain } from "@/components/navigation-menus/nav-main";
import { NavBots } from "@/components/navigation-menus/nav-bots";
import { WorkspaceLink } from "@/app/(app)/(workspace)/components/link";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { state, isMobile, toggleSidebar } = useSidebar();
	const { botId, businessId } = useParams();
	const [currentNavbar, setCurrentNavbar] = React.useState<"default" | "bot" | "business">(
		"default",
	);
	React.useEffect(() => {
		if (botId) {
			setCurrentNavbar("bot");
		} else if (businessId) {
			setCurrentNavbar("business");
		} else {
			setCurrentNavbar("default");
		}
	}, [botId, businessId, pathname]);

	// Add effect to collapse sidebar on mobile when pathname changes
	React.useEffect(() => {
		if (typeof window !== "undefined" && isMobile && state === "expanded") {
			toggleSidebar();
		}
	}, [pathname, isMobile, state, toggleSidebar]);

	const NavUser = dynamic(() => import("@/components/navigation-menus/nav-user"), { ssr: false });
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<WorkspaceSwitcher />
				{currentNavbar !== "default" && state === "expanded" && (
					<WorkspaceLink
						href={
							currentNavbar == "bot"
								? "/businesses/{businessId}/bots"
								: currentNavbar == "business"
									? "/businesses"
									: undefined
						}
						className="space-x-4 group hover:text-muted-foreground flex py-2 text-sm w-full  items-center"
					>
						<ChevronLeft
							className="h-4 w-4 transition-transform duration-100 hover:-translate-x-0.5"
							strokeWidth={2}
						/>
						{currentNavbar}
					</WorkspaceLink>
				)}
			</SidebarHeader>
			<SidebarContent>
				<AnimatePresence mode="wait">
					{currentNavbar == "default" && (
						<motion.div
							key="default"
							initial="enter"
							animate="center"
							exit="exit"
							variants={sidebarData.baseSlideVariants}
							transition={{ duration: 0.1, type: "tween" }}
						>
							<NavMain items={sidebarData.mainNavigationMenus} />
							<NavBusinesses />
							<NavBots />
							<NavMain
								title="Workspace"
								items={sidebarData.workspaceNavigationMenus}
							/>
							<NavMain title="Community" items={sidebarData.baseAppNavigationMenus} />
						</motion.div>
					)}
					{currentNavbar == "business" && (
						<motion.div
							key="bot"
							initial="enter"
							animate="center"
							exit="exit"
							variants={sidebarData.slideVariants}
							transition={{ duration: 0.1, type: "tween" }}
						>
							<NavMain items={sidebarData.businessNavigationMenus} />
						</motion.div>
					)}

					{currentNavbar == "bot" && (
						<motion.div
							key="bot"
							initial="enter"
							animate="center"
							exit="exit"
							variants={sidebarData.slideVariants}
							transition={{ duration: 0.1, type: "tween" }}
						>
							<NavMain items={sidebarData.botNavigationMenus} />
						</motion.div>
					)}
				</AnimatePresence>
			</SidebarContent>
			<SidebarFooter>
				<React.Suspense fallback={<Skeleton className="w-full h-8" />}>
					<NavUser />
				</React.Suspense>
			</SidebarFooter>
		</Sidebar>
	);
}
