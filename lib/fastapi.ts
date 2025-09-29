import { ApiClient } from "@/fastapi/ApiClient";
import { getCookie } from "./actions/client/cookies";

let sessionToken: string | null = null;

if (typeof window !== "undefined") {
	sessionToken = getCookie("auth.session.token") ?? "";
} else {
	sessionToken = await import("next/headers").then(({ cookies }) => {
		const cookieValue = cookies().get("auth.session.token")?.value || null;
		return cookieValue;
	});
}
const apiClient = () => {
	return new ApiClient({
		BASE: process.env.NEXT_PUBLIC_FAST_API_HOST,
		HEADERS: {
			...(sessionToken &&
				sessionToken.length > 1 && {
					Authorization: `Bearer ${sessionToken}`,
				}),
		},
	});
};
const fastApi = apiClient();
export default fastApi;
