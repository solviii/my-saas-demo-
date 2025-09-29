export const CONFIG = {
	INVITATION_EMAIL_FROM: "invitations@{**}.io",
};
export const R2_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL as string;

export const PROTOCOL = process.env.NODE_ENV == "development" ? "http" : "https";
export const DOMAIN = process.env.NODE_ENV == "development" ? "localhost:3000" : "{**}";

export const APP_HOSTNAMES = new Set([`app.${DOMAIN}`, "app.localhost:3000"]);
export const ADMIN_HOSTNAMES = new Set([`admin.${DOMAIN}`, "admin.localhost:3000"]);

export const ROOT_ORIGIN = `${PROTOCOL}://${DOMAIN}`;
export const APP_ORIGIN = `${PROTOCOL}://app.${DOMAIN}`;
