'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/design/ui/components/button';

import { CoordinatedModal } from '@/features/overlays/client';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

export function WorkspaceLeaseConflictDialog() {
	const pathname = usePathname();
	const router = useRouter();
	const {
		dismissLeaseConflict,
		leaseConflict,
		openWorkspaceReadOnly,
		pendingExportWorkspaceId,
		takeOverWorkspace,
	} = useResourceWorkspaces();
	const [error, setError] = useState<string | null>(null);
	const [pendingAction, setPendingAction] = useState<
		'read-only' | 'takeover' | null
	>(null);
	useEffect(() => {
		setError(null);
		setPendingAction(null);
	}, [leaseConflict?.workspace.id]);

	if (!leaseConflict) return null;
	const isExportRequest =
		pendingExportWorkspaceId === leaseConflict.workspace.id;

	const runAction = async (action: 'read-only' | 'takeover') => {
		setPendingAction(action);
		setError(null);
		const result =
			action === 'read-only'
				? await openWorkspaceReadOnly(leaseConflict.workspace.id)
				: await takeOverWorkspace();
		setPendingAction(null);
		if (!result.isSuccess) {
			setError(result.error ?? '无法打开资源包');
			return;
		}
		if (!pendingExportWorkspaceId && pathname === '/') router.push('/info');
	};

	return (
		<CoordinatedModal
			coordination={{ id: 'workspace.lease-conflict' }}
			hideCloseButton
			isDismissable={false}
			isKeyboardDismissDisabled
			isOpen
			size="md"
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<h2 className="text-lg font-semibold">
						资源包正在其他页面中编辑
					</h2>
					<p className="text-sm leading-6 text-foreground-600">
						{isExportRequest
							? `可以直接导出“${leaseConflict.workspace.displayName}”当前保存的内容，也可以接管后导出。接管后，其他页面将不能继续保存。`
							: `可以只读查看“${leaseConflict.workspace.displayName}”，也可以接管编辑。接管后，其他页面将不能继续保存。`}
					</p>
					{error && <p className="text-sm text-danger">{error}</p>}
				</div>
				<div className="flex flex-wrap justify-end gap-2 border-t border-divider pt-4">
					<Button
						variant="light"
						isDisabled={pendingAction !== null}
						onPress={() => {
							dismissLeaseConflict();
							router.push('/');
						}}
					>
						返回资源包列表
					</Button>
					<Button
						variant="flat"
						isLoading={pendingAction === 'read-only'}
						isDisabled={pendingAction === 'takeover'}
						onPress={() => void runAction('read-only')}
					>
						{isExportRequest ? '只读导出' : '只读查看'}
					</Button>
					<Button
						color="warning"
						isLoading={pendingAction === 'takeover'}
						isDisabled={pendingAction === 'read-only'}
						onPress={() => void runAction('takeover')}
					>
						{isExportRequest ? '接管并导出' : '接管编辑'}
					</Button>
				</div>
			</div>
		</CoordinatedModal>
	);
}
