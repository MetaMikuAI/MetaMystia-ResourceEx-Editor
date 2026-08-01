/**
 * RSA-2048 (SHA-256) signature utilities for ID range allocation.
 *
 * The public key is loaded from an external PEM file for client-side verification.
 * Private keys are NEVER persisted — they are kept only in memory
 * for the duration of a single signing operation.
 */

import 'client-only';

import PUBLIC_KEY_PEM from './public.pem';

function pemToArrayBuffer(
	pem: string,
	label: 'PUBLIC KEY' | 'PRIVATE KEY'
): ArrayBuffer {
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
	for (let index = 0; index < binary.length; index++) {
		buf[index] = binary.charCodeAt(index);
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
	if (pem.includes('BEGIN PRIVATE KEY')) {
		return crypto.subtle.importKey(
			'pkcs8',
			pemToArrayBuffer(pem, 'PRIVATE KEY'),
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			false,
			['sign']
		);
	}

	throw new Error(
		'请使用PKCS#8格式的私钥。如果你的私钥是"BEGIN RSA PRIVATE KEY"格式，请使用以下命令转换：\n' +
			'openssl pkcs8 -topk8 -nocrypt -in rsa_private.pem -out private_key.pem'
	);
}

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
			`签名失败：${error instanceof Error ? error.message : String(error)}`
		);
	}
}

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
		for (let index = 0; index < sigBinary.length; index++) {
			sigView[index] = sigBinary.charCodeAt(index);
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
