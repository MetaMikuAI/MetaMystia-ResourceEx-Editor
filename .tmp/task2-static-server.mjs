import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const host = '127.0.0.1';
const port = 3101;
const root = resolve('out');

const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.woff2': 'font/woff2',
};

async function isFile(path) {
	try {
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}

createServer(async (request, response) => {
	const pathname = decodeURIComponent(
		new URL(request.url ?? '/', `http://${host}:${port}`).pathname
	);
	const relativePath = pathname === '/' ? '/index.html' : pathname;
	const exactPath = resolve(root, `.${relativePath}`);

	if (exactPath !== root && !exactPath.startsWith(`${root}${sep}`)) {
		response.writeHead(400).end('Bad Request');
		return;
	}

	const candidates = extname(exactPath)
		? [exactPath]
		: [exactPath, `${exactPath}.html`, resolve(exactPath, 'index.html')];
	const path = await candidates.reduce(
		async (resolvedPathPromise, candidate) => {
			const resolvedPath = await resolvedPathPromise;
			return resolvedPath ?? ((await isFile(candidate)) ? candidate : null);
		},
		Promise.resolve(null)
	);
	const selectedPath = path ?? resolve(root, '404.html');
	const status = path === null ? 404 : 200;
	const contentType =
		contentTypes[extname(selectedPath)] ?? 'application/octet-stream';

	response.writeHead(status, {
		'Content-Type': contentType,
		'X-Content-Type-Options': 'nosniff',
	});
	if (request.method === 'HEAD') {
		response.end();
		return;
	}
	createReadStream(selectedPath).pipe(response);
}).listen(port, host, () => {
	console.log(`Task 2 static server listening at http://${host}:${port}`);
});
