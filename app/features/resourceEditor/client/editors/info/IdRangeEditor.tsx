'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '@/design/ui/components/button';
import Input from '@/design/ui/components/input';
import Modal from '@/design/ui/components/modal';

import type { PackInfo } from '@/domain/resourcePack/contracts/resourceEx';

import { EditorField } from '@/features/resourceEditor/client/components/fields/EditorField';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

import { useIdRangeEditor } from './useIdRangeEditor';

interface IdRangeEditorProps {
	packInfo: PackInfo;
	onUpdate: (updates: Partial<PackInfo>) => void;
}

export function IdRangeEditor({ packInfo, onUpdate }: IdRangeEditorProps) {
	const [showKeyDialog, setShowKeyDialog] = useState(false);
	const [dialogMode, setDialogMode] = useState<'sign' | 'paste'>('sign');
	const [privateKey, setPrivateKey] = useState('');
	const [pastedSignature, setPastedSignature] = useState('');
	const [signing, setSigning] = useState(false);
	const [signError, setSignError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const isMountedRef = useRef(false);
	const openDialogTriggerRef = useRef<HTMLButtonElement>(null);
	const signingOperationIdRef = useRef(0);
	const { idRangeStart, idRangeEnd, idSignature, label } = packInfo;
	const {
		canSign,
		managedIdMax,
		managedIdMin,
		rangeError,
		sign,
		verifyStatus,
	} = useIdRangeEditor({ idRangeEnd, idRangeStart, idSignature, label });

	const invalidateSigning = useCallback(() => {
		signingOperationIdRef.current += 1;
		setSigning(false);
	}, []);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			signingOperationIdRef.current += 1;
		};
	}, []);

	useEffect(() => {
		invalidateSigning();
	}, [idRangeEnd, idRangeStart, invalidateSigning, label]);

	// Dialog management
	const openDialog = useCallback(() => {
		setSignError(null);
		setPrivateKey('');
		setPastedSignature('');
		setDialogMode('paste');
		setShowKeyDialog(true);
	}, []);

	const closeDialog = useCallback(() => {
		invalidateSigning();
		setShowKeyDialog(false);
		setPrivateKey('');
		setPastedSignature('');
		setSignError(null);
		requestAnimationFrame(() => openDialogTriggerRef.current?.focus());
	}, [invalidateSigning]);

	const handleDialogOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				closeDialog();
			}
		},
		[closeDialog]
	);

	const handleSign = useCallback(async () => {
		const operationId = signingOperationIdRef.current + 1;
		signingOperationIdRef.current = operationId;
		setSigning(true);
		setSignError(null);
		try {
			const sig = await sign(privateKey);
			if (
				!isMountedRef.current ||
				signingOperationIdRef.current !== operationId
			) {
				return;
			}
			onUpdate({ idSignature: sig });
			closeDialog();
		} catch (e) {
			if (
				!isMountedRef.current ||
				signingOperationIdRef.current !== operationId
			) {
				return;
			}
			setSignError(
				'签名失败: ' + (e instanceof Error ? e.message : String(e))
			);
		} finally {
			if (
				isMountedRef.current &&
				signingOperationIdRef.current === operationId
			) {
				setSigning(false);
			}
		}
	}, [closeDialog, onUpdate, privateKey, sign]);

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
					<Input
						type="number"
						value={
							idRangeStart === undefined
								? ''
								: String(idRangeStart)
						}
						onChange={(e) => {
							const v = parseInt(e.target.value);
							onUpdate({
								idRangeStart: isNaN(v) ? undefined : v,
							});
						}}
						placeholder={`最小 ${managedIdMin}`}
						min={managedIdMin}
						max={managedIdMax}
						isInvalid={Boolean(rangeError)}
					/>
				</EditorField>

				<EditorField label="ID段结束 (End, 含)">
					<Input
						type="number"
						value={
							idRangeEnd === undefined ? '' : String(idRangeEnd)
						}
						onChange={(e) => {
							const v = parseInt(e.target.value);
							onUpdate({ idRangeEnd: isNaN(v) ? undefined : v });
						}}
						placeholder={`最大 ${managedIdMax}`}
						min={managedIdMin}
						max={managedIdMax}
						isInvalid={Boolean(rangeError)}
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
					<Button
						ref={openDialogTriggerRef}
						variant="light"
						size="sm"
						onPress={openDialog}
						isDisabled={!canSign}
						className="h-6 px-2 text-xs"
					>
						签名
					</Button>
				}
			>
				<div className="flex items-center gap-2">
					<Input
						value={idSignature || ''}
						readOnly
						placeholder={'点击「签名」按钮进行签名…'}
						className="font-mono text-xs"
					/>
					<button
						onClick={() => {
							if (!idSignature) return;
							navigator.clipboard
								.writeText(idSignature)
								.then(() => {
									setCopied(true);
									setTimeout(() => setCopied(false), 2000);
								});
						}}
						disabled={!idSignature}
						title={copied ? '已复制' : '复制签名'}
						className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white/40 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:bg-black/10 ${
							copied
								? 'border-green-500 text-green-600 dark:text-green-400'
								: 'border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5'
						}`}
					>
						{copied ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect
									width="14"
									height="14"
									x="8"
									y="8"
									rx="2"
									ry="2"
								/>
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
						)}
					</button>
				</div>
			</EditorField>

			{/* Signing dialog */}
			<Modal
				isOpen={showKeyDialog}
				onOpenChange={handleDialogOpenChange}
				size="lg"
				classNames={{ body: 'gap-0 py-3' }}
			>
				<h4 className="mb-4 text-lg font-bold">设置签名</h4>

				{/* Tab switcher */}
				<div className="mb-4 flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
					<button
						onClick={() => {
							invalidateSigning();
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
					<button
						onClick={() => {
							invalidateSigning();
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
							onChange={(e) => setPastedSignature(e.target.value)}
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
						<Button
							variant="light"
							size="sm"
							onPress={handleSign}
							isDisabled={!privateKey.trim() || signing}
							className="h-8 px-4 text-sm"
						>
							{signing ? '签名中…' : '确认签名'}
						</Button>
					) : (
						<Button
							variant="light"
							size="sm"
							onPress={() => {
								const trimmed = pastedSignature.trim();
								if (!trimmed) return;
								onUpdate({ idSignature: trimmed });
								closeDialog();
							}}
							isDisabled={!pastedSignature.trim()}
							className="h-8 px-4 text-sm"
						>
							应用签名
						</Button>
					)}
				</div>
			</Modal>
		</div>
	);
}
