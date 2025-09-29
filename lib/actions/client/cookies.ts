import Cookies from "cookies-js";

export interface CookieOptions {
	path?: string;
	domain?: string;
	expires?: number | string | Date;
	secure?: boolean;
}

export function getCookie(key: string): string | undefined {
	if (typeof window !== "undefined") {
		return Cookies.get(key);
	}
}

export function setCookie(key: string, value: string, expires: number): void {
	if (typeof window !== "undefined") {
		document.cookie = `${key}=${value}; expires=${new Date(expires)}; path=/`;
	}
}

export function removeCookie(key: string, options?: CookieOptions): void {
	if (typeof window !== "undefined") {
		Cookies.expire(key, options);
	}
}
