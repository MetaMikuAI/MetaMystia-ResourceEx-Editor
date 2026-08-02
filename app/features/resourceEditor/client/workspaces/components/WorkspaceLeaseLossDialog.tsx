'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/design/ui/components/button';

import { CoordinatedModal } from '@/features/overlays/client';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

export function WorkspaceLeaseLossDialog() {
	const pathname = usePathname();
	const router = useRouter();
	const {
		discardLeaseLossChanges,
		dismissResolvedLeaseLoss,
		leaseLoss,
		saveLeaseLossAsCopy,
	} = useResourceWorkspaces();
	const [error, setError] = useState<string | null>(null);
	const [pendingAction, setPendingAction] = useState<
		'discard' | 'save-copy' | null
	>(null);

	useEffect(() => {
		setError(null);
		setPendingAction(null);
	}, [leaseLoss?.workspace.id]);

	useEffect(() => {
		if (!leaseLoss?.isResolved) return;
		if (pathname === '/') {
			dismissResolvedLeaseLoss();
			return;
		}
		router.replace('/');
	}, [dismissResolvedLeaseLoss, leaseLoss?.isResolved, pathname, router]);

	if (!leaseLoss) return null;

	const runAction = async (action: 'discard' | 'save-copy') => {
		setPendingAction(action);
		setError(null);
		const result =
			action === 'save-copy'
				? await saveLeaseLossAsCopy()
				: await discardLeaseLossChanges();
		if (!result.isSuccess) {
			setPendingAction(null);
			setError(result.error ?? '无法处理当前修改');
		}
	};

	return (
		<CoordinatedModal
			coordination={{ id: 'workspace.lease-loss' }}
			hideCloseButton
			isDismissable={false}
			isKeyboardDismissDisabled
			isOpen
			size="md"
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<h2 className="text-lg font-semibold">
						编辑权已被其他页面接管
					</h2>
					{leaseLoss.isResolved ? (
						<p className="text-sm leading-6 text-foreground-600">
							正在返回资源包管理…
						</p>
					) : leaseLoss.hasChanges ? (
						<div className="space-y-2 text-sm leading-6 text-foreground-600">
							{leaseLoss.hasUnsavedChanges ? (
								<p>
									当前页面还有未保存到“
									{leaseLoss.workspace.displayName}
									”的额外修改。不保存副本将丢失这部分修改。
								</p>
							) : (
								<p>
									当前编辑内容已经自动保存到“
									{leaseLoss.workspace.displayName}
									”，新接管页面会继续使用这些内容。
								</p>
							)}
							<p>
								如需另外保留当前版本，可以选择“保存为副本”以创建新工作区“
								{leaseLoss.copyDisplayName}
								”，创建后将自动返回资源包管理。
							</p>
						</div>
					) : (
						<p className="text-sm leading-6 text-foreground-600">
							当前页面没有需要另行保留的修改，返回资源包管理后可查看最新状态。
						</p>
					)}
					{error && <p className="text-sm text-danger">{error}</p>}
				</div>
				{!leaseLoss.isResolved && (
					<div className="flex flex-wrap justify-end gap-2 border-t border-divider pt-4">
						{leaseLoss.hasChanges && (
							<Button
								color={
									leaseLoss.hasUnsavedChanges
										? 'danger'
										: 'default'
								}
								variant="flat"
								isDisabled={pendingAction === 'save-copy'}
								isLoading={pendingAction === 'discard'}
								onPress={() => void runAction('discard')}
							>
								{leaseLoss.hasUnsavedChanges
									? '放弃未保存的修改'
									: '不创建副本'}
							</Button>
						)}
						<Button
							color={leaseLoss.hasChanges ? 'primary' : 'default'}
							variant={leaseLoss.hasChanges ? 'solid' : 'flat'}
							isDisabled={pendingAction === 'discard'}
							isLoading={
								pendingAction ===
								(leaseLoss.hasChanges ? 'save-copy' : 'discard')
							}
							onPress={() =>
								void runAction(
									leaseLoss.hasChanges
										? 'save-copy'
										: 'discard'
								)
							}
						>
							{leaseLoss.hasChanges
								? '保存为副本'
								: '返回资源包管理'}
						</Button>
					</div>
				)}
			</div>
		</CoordinatedModal>
	);
}
