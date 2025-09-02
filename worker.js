addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {

	const DOMAINS = [
		"twhlynch.me",
		"grab-tools.live",
		"grabvr.tools"
	]

	const headers = new Headers({
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type'
	});

	const origin = request.headers.get('Origin');
	const hostname = (new URL(origin)).hostname;
	const domain = hostname.split('.').slice(-2).join('.');
	if (DOMAINS.includes(domain)) {
		headers.set('Access-Control-Allow-Origin', origin);
	}

	if (request.method === 'OPTIONS') {
		if (DOMAINS.includes(domain)) {
         return new Response(null, { headers });
      }
		return new Response('Not allowed', { status: 403 });
	}

	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { headers, status: 405 });
	}

	const contentType = request.headers.get('content-type') || '';
	if (!contentType.includes('application/json')) {
		return new Response('Unsupported Media Type', { headers, status: 415 });
	}

	try {
		const { url, ignore } = await request.json();
		const urlKey = new URL(url).hostname + new URL(url).pathname;

		let value = await VIEWS.get(urlKey) || "0";

		if (!ignore) {
			value = (parseInt(value) + 1).toString();
			await VIEWS.put(urlKey, value);
		}

		return new Response(value, { headers, status: 200 });
	} catch (error) {
		console.error('Error:', error);
		return new Response('Internal Server Error', { headers, status: 500 });
	}
}