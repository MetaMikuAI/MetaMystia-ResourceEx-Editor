/**
 * RSA-2048 (SHA-256) signature utilities for ID range allocation.
 *
 * The public key is embedded for client-side verification.
 * Private keys are NEVER persisted — they are kept only in memory
 * for the duration of a single signing operation.
 */

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvI3be1KGxa3ZAodaVWEr
5DX3nKUHVw6fyPnEGDUse1PZOMeLauM/ZTJWa+wB+wc/vsJW59wBvy8Q7Tbal9cT
8o1K6NQq6juR1tUxZXQUqsMeAYEZBykR5KmwAKXXQeWCHDP0ZQSOJ5A25ZxCJH+I
1pVGx1VTPqWL7NpAAxsfZ3EbgOvsolc4YtFb9OqjYEeVXnCMR9TA3rmD7dNYPhO6
Jy+lsZlCch9Y3GgGbLQ4Mdq3h0FuhkfHUuHsmHcibeNfV+AKatZsHoybG4meFG73
4hgzy+khLGyZSEcx4CmP/izKuAgoLAnnINNqNiOTltlpRoLaPfGQX8swwmr7nQh1
sQIDAQAB
-----END PUBLIC KEY-----`;

/** ID range boundaries */
export const GAME_ID_MAX = 8999;
export const MANAGED_ID_MIN = 9000;
export const MANAGED_ID_MAX = 1073741823;
export const UNMANAGED_ID_MIN = 1073741824;
export const UNMANAGED_ID_MAX = 2147483647;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pemToArrayBuffer(
	pem: string,
	label: 'PUBLIC KEY' | 'PRIVATE KEY'
): ArrayBuffer {
	// Extract base64 content between BEGIN and END markers
	const lines = pem.split(/[\r\n]+/);
	const base64Lines: string[] = [];
	let insideBlock = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (
			trimmed.includes(`-----BEGIN ${label}-----`) ||
			trimmed.includes(`-----BEGIN RSA ${label}-----`)
		) {
			insideBlock = true;
			continue;
		}
		if (trimmed.includes('-----END')) {
			insideBlock = false;
			continue;
		}
		if (insideBlock && trimmed) {
			base64Lines.push(trimmed);
		}
	}

	const b64 = base64Lines.join('');
	const binary = atob(b64);
	const buf = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		buf[i] = binary.charCodeAt(i);
	}
	return buf.buffer;
}

function buildMessage(
	packLabel: string,
	start: number,
	end: number
): ArrayBuffer {
	const encoded = new TextEncoder().encode(`${packLabel}:${start}-${end}`);
	return encoded.buffer.slice(
		encoded.byteOffset,
		encoded.byteOffset + encoded.byteLength
	);
}

// ---------------------------------------------------------------------------
// Key import
// ---------------------------------------------------------------------------

async function importPublicKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'spki',
		pemToArrayBuffer(PUBLIC_KEY_PEM, 'PUBLIC KEY'),
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['verify']
	);
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
	// Try PKCS#8 format first (BEGIN PRIVATE KEY)
	if (pem.includes('BEGIN PRIVATE KEY')) {
		return crypto.subtle.importKey(
			'pkcs8',
			pemToArrayBuffer(pem, 'PRIVATE KEY'),
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			false,
			['sign']
		);
	}

	// Fall back to PKCS#1 format (BEGIN RSA PRIVATE KEY)
	// Note: Web Crypto API doesn't support PKCS#1 directly, need conversion
	throw new Error(
		'请使用 PKCS#8 格式的私钥。如果你的私钥是 "BEGIN RSA PRIVATE KEY" 格式，请使用以下命令转换：\n' +
			'openssl pkcs8 -topk8 -nocrypt -in rsa_private.pem -out private_key.pem'
	);
}

// ---------------------------------------------------------------------------
// Sign & Verify
// ---------------------------------------------------------------------------

/**
 * Sign `"<label>:<start>-<end>"` with the given PEM-encoded RSA private key.
 * Returns the signature as a Base64 string.
 */
export async function signIdRange(
	privateKeyPem: string,
	packLabel: string,
	start: number,
	end: number
): Promise<string> {
	try {
		console.log('[signIdRange] 开始签名:', { packLabel, start, end });
		console.log('[signIdRange] 私钥长度:', privateKeyPem.length);

		const privateKey = await importPrivateKey(privateKeyPem);
		console.log('[signIdRange] 私钥导入成功');

		const message = buildMessage(packLabel, start, end);
		console.log('[signIdRange] 消息构建完成，长度:', message.byteLength);

		const signature = await crypto.subtle.sign(
			'RSASSA-PKCS1-v1_5',
			privateKey,
			message
		);
		console.log('[signIdRange] 签名成功，长度:', signature.byteLength);

		const result = btoa(String.fromCharCode(...new Uint8Array(signature)));
		console.log('[signIdRange] Base64 编码完成，长度:', result.length);
		return result;
	} catch (error) {
		console.error('[signIdRange] 签名失败:', error);
		throw new Error(
			`签名失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

/**
 * Verify a Base64-encoded signature for `"<label>:<start>-<end>"`
 * using the embedded public key.
 */
export async function verifyIdRange(
	packLabel: string,
	start: number,
	end: number,
	signatureBase64: string
): Promise<boolean> {
	try {
		const publicKey = await importPublicKey();
		const message = buildMessage(packLabel, start, end);
		const sigBinary = atob(signatureBase64);
		const sigBuf = new ArrayBuffer(sigBinary.length);
		const sigView = new Uint8Array(sigBuf);
		for (let i = 0; i < sigBinary.length; i++) {
			sigView[i] = sigBinary.charCodeAt(i);
		}
		return crypto.subtle.verify(
			'RSASSA-PKCS1-v1_5',
			publicKey,
			sigBuf,
			message
		);
	} catch {
		return false;
	}
}
