export default {
	fetch: handle_request,
};

async function handle_request(request: Request, env: Env) {
	const headers = build_headers(request);
	const res = validate_request(request);
	if (res) return new Response(res.body || null, { headers, status: res.status });

	try {
		const { url, ignore } = (await request.json()) as { url: string; ignore: boolean };

		let url_key = new URL(url).hostname + new URL(url).pathname;
		if (url_key.endsWith("/")) url_key = url_key.slice(0, -1);

		let value = (await env.VIEWS.get(url_key)) ?? "0";

		if (!ignore) await env.VIEWS.put(url_key, `${parseInt(value) + 1}`);

		return new Response(value, { headers, status: 200 });
	} catch (error) {
		console.error("Error:", error);
		return new Response("Internal Server Error", { headers, status: 500 });
	}
}

function build_headers(request: Request) {
	const DOMAINS = ["twhlynch.me"];

	const headers = new Headers({
		"Content-Type": "application/json",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
	});

	const origin = request.headers.get("Origin");
	if (origin) {
		const hostname = new URL(origin).hostname;
		const domain = hostname.split(".").slice(-2).join(".");
		if (DOMAINS.includes(domain) || DOMAINS.includes(hostname)) {
			headers.set("Access-Control-Allow-Origin", origin);
		}
	}

	return headers;
}

function validate_request(request: Request) {
	if (request.method === "OPTIONS") return {};
	if (request.method !== "POST") return { body: "Method Not Allowed", status: 405 };

	const content_type = request.headers.get("Content-Type");
	if (content_type !== "application/json") return { body: "Unsupported Media Type", status: 415 };

	return null; // valid
}
