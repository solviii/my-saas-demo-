import React from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

interface LogoProps {
	size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const sizeMap = {
	xxs: "w-4 h-4",
	xs: "w-6 h-6",
	sm: "w-8 h-8",
	md: "w-12 h-12",
	lg: "w-16 h-16",
	xl: "w-20 h-20",
	xxl: "w-24 h-24",
};

export default function Logo({ size = "md" }: LogoProps) {
	return (
		<div className={`relative ${sizeMap[size]}`}>
			<Image
				width={926}
				height={922}
				src={siteConfig.r2.logoUrl}
				alt="Logo"
				className="object-contain"
				priority
			/>
		</div>
	);
}
