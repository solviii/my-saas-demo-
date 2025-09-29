"use server";
import slugify from "slugify";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/services/prisma";

const WORKSPACE_CONFIG = {
	maxNameGenerationAttempts: 5,
	nameGenerationCharSet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
} as const;

async function hashPassword<T extends { password: string }>(data: T): Promise<T> {
	if (data.password) {
		data.password = await bcrypt.hash(
			data.password,
			parseInt(`${process.env.SALT_ROUNDS}`, 10),
		);
	}
	return data;
}

async function comparePassword(
	password: string,
	hash: string,
): Promise<{ matched: boolean; error: string | null }> {
	try {
		const matched = await bcrypt.compare(password, hash);
		return { matched, error: null };
	} catch (error: any) {
		return { matched: false, error: error.message };
	}
}
function generateRandomString(length: number): string {
	const { nameGenerationCharSet } = WORKSPACE_CONFIG;
	return Array.from({ length }, () =>
		nameGenerationCharSet.charAt(Math.floor(Math.random() * nameGenerationCharSet.length)),
	).join("");
}

async function generateUniqueName(baseName: string, model: string): Promise<string> {
	const { maxNameGenerationAttempts } = WORKSPACE_CONFIG;
	const notAllowedNames = [
		"/",
		"affiliate",
		"auth",
		"api",
		"chats",
		"not-found",
		"error",
		"onboarding",
	];
	let attempts = 0;
	let isUnique = false;
	let name = slugify(baseName, {
		lower: true,
		trim: true,
		strict: true,
		remove: /[*+~.()'"!:@]/g,
	});

	while (!isUnique && attempts < maxNameGenerationAttempts) {
		// @ts-ignore
		const existing = await prisma[model].findFirst({
			where: { name },
		});

		if (!existing && !notAllowedNames.includes(name)) {
			isUnique = true;
		} else {
			name = `${slugify(baseName, { lower: true, trim: true })}-${generateRandomString(4)}`;
			attempts++;
		}
	}

	if (!isUnique) {
		throw new Error("Unable to generate unique workspace name after multiple attempts");
	}

	return name;
}
export { hashPassword, comparePassword, generateUniqueName };
