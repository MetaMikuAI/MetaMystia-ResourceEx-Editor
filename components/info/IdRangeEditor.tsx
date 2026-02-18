'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { EditorField } from '@/components/common/EditorField';
import { TextInput } from '@/components/common/TextInput';
import { ErrorBadge } from '@/components/common/ErrorBadge';
import {
	signIdRange,
	verifyIdRange,
	MANAGED_ID_MIN,
	MANAGED_ID_MAX,
} from '@/lib/crypto';
import type { PackInfo } from '@/types/resource';

interface IdRangeEditorProps {
	packInfo: PackInfo;
	onUpdate: (updates: Partial<PackInfo>) => void;
}

type VerifyStatus = 'idle' | 'valid' | 'invalid' | 'verifying';

export function IdRangeEditor({ packInfo, onUpdate }: IdRangeEditorProps) {
	const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
	const [showKeyDialog, setShowKeyDialog] = useState(false);
	const [dialogMode, setDialogMode] = useState<'sign' | 'paste'>('sign');
	const [privateKey, setPrivateKey] = useState('');
	const [pastedSignature, setPastedSignature] = useState('');
	const [signing, setSigning] = useState(false);
	const [signError, setSignError] = useState<string | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const { idRangeStart, idRangeEnd, idSignature, label } = packInfo;

	// Verify signature whenever relevant fields change
	useEffect(() => {
		if (
			!label ||
			idRangeStart == null ||
			idRangeEnd == null ||
			!idSignature
		) {
			setVerifyStatus('idle');
			return;
		}

		let cancelled = false;
		setVerifyStatus('verifying');
		verifyIdRange(label, idRangeStart, idRangeEnd, idSignature).then(
			(ok) => {
				if (!cancelled) setVerifyStatus(ok ? 'valid' : 'invalid');
			}
		);
		return () => {
			cancelled = true;
		};
	}, [label, idRangeStart, idRangeEnd, idSignature]);

	// Range validation
	const rangeError = (() => {
		if (idRangeStart == null && idRangeEnd == null) return null;
		if (idRangeStart == null || idRangeEnd == null)
			return '请同时填写起始和结束';
		if (idRangeStart < MANAGED_ID_MIN)
			return `起始ID不能小于 ${MANAGED_ID_MIN}`;
		if (idRangeEnd > MANAGED_ID_MAX)
			return `结束ID不能大于 ${MANAGED_ID_MAX}`;
		if (idRangeStart > idRangeEnd) return '起始ID不能大于结束ID';
		return null;
	})();

	const canSign =
		!!label && idRangeStart != null && idRangeEnd != null && !rangeError;

	// Dialog management
	const openDialog = useCallback(() => {
		setSignError(null);
		setPrivateKey('');
		setPastedSignature('');
		setDialogMode('sign');
		setShowKeyDialog(true);
		requestAnimationFrame(() => dialogRef.current?.showModal());
	}, []);

	const closeDialog = useCallback(() => {
		dialogRef.current?.close();
		setShowKeyDialog(false);
		setPrivateKey('');
		setPastedSignature('');
		setSignError(null);
	}, []);

	const handleSign = useCallback(async () => {
		if (!label || idRangeStart == null || idRangeEnd == null) return;
		setSigning(true);
		setSignError(null);
		try {
			const sig = await signIdRange(
				privateKey,
				label,
				idRangeStart,
				idRangeEnd
			);
			onUpdate({ idSignature: sig });
			closeDialog();
		} catch (e) {
			setSignError(
				'签名失败: ' + (e instanceof Error ? e.message : String(e))
			);
		} finally {
			setSigning(false);
		}
	}, [privateKey, label, idRangeStart, idRangeEnd, onUpdate, closeDialog]);

	return (
		<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					ID 段分配 (ID Range Allocation)
				</h3>
				{verifyStatus === 'valid' && (
					<span className="text-xs font-medium text-green-600 dark:text-green-400">
						✓ 签名验证通过
					</span>
				)}
				{verifyStatus === 'invalid' && (
					<ErrorBadge>签名无效</ErrorBadge>
				)}
			</div>

			<p className="text-xs leading-relaxed opacity-50">
				请务必参考
				<a
					href="https://doc.meta-mystia.izakaya.cc/resource_ex/why_add_signature_check.html"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary underline"
				>
					有关ID签名校验机制的说明（资源包创作者请注意）
				</a>
			</p>

			{/* Start / End */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<EditorField label="ID段起始 (Start, 含)">
					<TextInput
						type="number"
						value={idRangeStart ?? ''}
						onChange={(e) => {
							const v = parseInt(e.target.value);
							onUpdate({
								idRangeStart: isNaN(v) ? undefined : v,
							});
						}}
						placeholder={`最小 ${MANAGED_ID_MIN}`}
						min={MANAGED_ID_MIN}
						max={MANAGED_ID_MAX}
						error={!!rangeError}
					/>
				</EditorField>

				<EditorField label="ID段结束 (End, 含)">
					<TextInput
						type="number"
						value={idRangeEnd ?? ''}
						onChange={(e) => {
							const v = parseInt(e.target.value);
							onUpdate({ idRangeEnd: isNaN(v) ? undefined : v });
						}}
						placeholder={`最大 ${MANAGED_ID_MAX}`}
						min={MANAGED_ID_MIN}
						max={MANAGED_ID_MAX}
						error={!!rangeError}
					/>
				</EditorField>
			</div>

			{rangeError && (
				<span className="text-xs text-danger">{rangeError}</span>
			)}

			{/* Signature */}
			<EditorField
				label="签名 (Signature)"
				actions={
					<button
						onClick={openDialog}
						disabled={!canSign}
						className="btn-mystia h-6 px-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
					>
						签名
					</button>
				}
			>
				<TextInput
					value={idSignature || ''}
					readOnly
					placeholder={'点击「签名」按钮进行签名…'}
					className="font-mono text-xs"
				/>
			</EditorField>

			{/* Signing dialog */}
			{showKeyDialog && (
				<dialog
					ref={dialogRef}
					className="w-full max-w-lg rounded-lg border border-black/10 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-white/10 dark:bg-zinc-900"
					onClose={closeDialog}
				>
					<h4 className="mb-4 text-lg font-bold">设置签名</h4>

					{/* Tab switcher */}
					<div className="mb-4 flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
						<button
							onClick={() => {
								setDialogMode('sign');
								setSignError(null);
							}}
							className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
								dialogMode === 'sign'
									? 'bg-white shadow dark:bg-zinc-700'
									: 'opacity-60 hover:opacity-80'
							}`}
						>
							使用私钥签名
						</button>
						<button
							onClick={() => {
								setDialogMode('paste');
								setSignError(null);
							}}
							className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
								dialogMode === 'paste'
									? 'bg-white shadow dark:bg-zinc-700'
									: 'opacity-60 hover:opacity-80'
							}`}
						>
							直接输入签名
						</button>
					</div>

					{dialogMode === 'sign' ? (
						<>
							<p className="mb-2 text-xs opacity-60">
								待签名内容: {label}:{idRangeStart}-{idRangeEnd}
							</p>
							<p className="mb-4 text-xs text-danger">
								私钥仅用于本次签名，不会被保存！
							</p>
							<textarea
								value={privateKey}
								onChange={(e) => setPrivateKey(e.target.value)}
								placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
								rows={6}
								className="mb-4 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 font-mono text-xs text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
							/>
						</>
					) : (
						<>
							<p className="mb-4 text-xs opacity-60">
								直接粘贴已有的 Base64 签名，提交后将自动验证。
							</p>
							<textarea
								value={pastedSignature}
								onChange={(e) =>
									setPastedSignature(e.target.value)
								}
								placeholder="粘贴 Base64 编码的签名…"
								rows={4}
								className="mb-4 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 font-mono text-xs text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
							/>
						</>
					)}

					{signError && (
						<p className="mb-4 text-xs text-danger">{signError}</p>
					)}
					<div className="flex justify-end gap-2">
						<button
							onClick={closeDialog}
							className="h-8 rounded-lg border border-black/10 px-4 text-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
						>
							取消
						</button>
						{dialogMode === 'sign' ? (
							<button
								onClick={handleSign}
								disabled={!privateKey.trim() || signing}
								className="btn-mystia h-8 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
							>
								{signing ? '签名中…' : '确认签名'}
							</button>
						) : (
							<button
								onClick={() => {
									const trimmed = pastedSignature.trim();
									if (!trimmed) return;
									onUpdate({ idSignature: trimmed });
									closeDialog();
								}}
								disabled={!pastedSignature.trim()}
								className="btn-mystia h-8 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
							>
								应用签名
							</button>
						)}
					</div>
				</dialog>
			)}
		</div>
	);
}
