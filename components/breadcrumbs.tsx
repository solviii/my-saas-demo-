"use client";
import React from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams, usePathname } from "next/navigation";
import { useWorkspace } from "@/app/(app)/contexts/workspace-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Breadcrumbs() {
	const pathName = usePathname();
	const { workspaceId } = useParams();
	const { workspace } = useWorkspace();
	const paths = pathName.split("/").filter((path) => path !== "");

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem className="md:block">
					<BreadcrumbLink href={"/" + workspaceId} className="capitalize">
						{workspace?.displayName || workspaceId}
					</BreadcrumbLink>
				</BreadcrumbItem>
				{paths.length === 1 ? (
					<>
						<BreadcrumbSeparator className="md:block" />
						<BreadcrumbItem>
							<BreadcrumbPage className="capitalize">Home</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				) : (
					paths.slice(1).map((path, index) => (
						<React.Fragment key={index}>
							<BreadcrumbSeparator className="md:block" />
							<BreadcrumbItem className="md:block">
								{index !== paths.length - 2 ? (
									<Tooltip>
										<TooltipTrigger asChild>
											<BreadcrumbLink
												href={`/${paths.slice(0, index + 2).join("/")}`}
												className="capitalize truncate"
											>
												{path.startsWith("cm") ? `[ID]` : path}
											</BreadcrumbLink>
										</TooltipTrigger>
										<TooltipContent>
											<p className="capitalize">{path}</p>
										</TooltipContent>
									</Tooltip>
								) : (
									<Tooltip>
										<TooltipTrigger asChild>
											<BreadcrumbPage className="capitalize">
												{path.startsWith("cm") ? `[ID]` : path}
											</BreadcrumbPage>
										</TooltipTrigger>
										<TooltipContent>
											<p className="capitalize">{path}</p>
										</TooltipContent>
									</Tooltip>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					))
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
