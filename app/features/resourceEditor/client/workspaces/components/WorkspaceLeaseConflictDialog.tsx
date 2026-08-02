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
		openWorkspaceForExport,
		pendingExportWorkspaceId,
		takeOverWorkspace,
	} = useResourceWorkspaces();
	const [error, setError] = useState<string | null>(null);
	const [pendingAction, setPendingAction] = useState<
		'export' | 'takeover' | null
	>(null);
	useEffect(() => {
		setError(null);
		setPendingAction(null);
	}, [leaseConflict?.workspace.id]);

	if (!leaseConflict) return null;
	const isExportRequest =
		pendingExportWorkspaceId === leaseConflict.workspace.id;

	const runAction = async (action: 'export' | 'takeover') => {
		setPendingAction(action);
		setError(null);
		const result =
			action === 'export'
				? await openWorkspaceForExport(leaseConflict.workspace.id)
				: await takeOverWorkspace();
		setPendingAction(null);
		if (!result.isSuccess) {
			setError(
				result.error ??
					(action === 'export'
						? '无法读取待导出的资源包'
						: '无法接管资源包')
			);
			return;
		}
		if (action === 'takeover' && !isExportRequest && pathname === '/') {
			router.push('/info');
		}
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
							: `“${leaseConflict.workspace.displayName}”正在其他页面中编辑。如需在当前页面修改，请先接管编辑权。接管后，其他页面将不能继续保存。`}
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
					{isExportRequest && (
						<Button
							variant="flat"
							isLoading={pendingAction === 'export'}
							isDisabled={pendingAction === 'takeover'}
							onPress={() => void runAction('export')}
						>
							直接导出
						</Button>
					)}
					<Button
						color="warning"
						isLoading={pendingAction === 'takeover'}
						isDisabled={pendingAction === 'export'}
						onPress={() => void runAction('takeover')}
					>
						{isExportRequest ? '接管并导出' : '接管编辑'}
					</Button>
				</div>
			</div>
		</CoordinatedModal>
	);
}
