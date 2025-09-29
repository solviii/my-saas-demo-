"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import React from "react";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
	actions: Array<{
		label: string;
		onClick?: (e: React.MouseEvent) => void;
		href?: string;
	}>;
}

export function DataTableRowActions<TData>({ actions }: DataTableRowActionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
				<Button variant="ghost" className="flex h-4 w-8 p-0 data-[state=open]:bg-muted">
					<DotsHorizontalIcon className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{actions.map((action, index) => (
					<React.Fragment key={index}>
						{action.href ? (
							<Link href={action.href}>
								<DropdownMenuItem>{action.label}</DropdownMenuItem>
							</Link>
						) : (
							<DropdownMenuItem onClick={action.onClick}>
								{action.label}
							</DropdownMenuItem>
						)}
						{index < actions.length - 1 && <DropdownMenuSeparator />}
					</React.Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
