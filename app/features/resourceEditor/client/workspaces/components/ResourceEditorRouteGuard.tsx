'use client';

import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useEffect, useRef } from 'react';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';
import { WorkspaceRecoveryDialog } from '@/features/resourceEditor/client/workspaces/components/WorkspaceRecoveryDialog';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

export function ResourceEditorRouteGuard({ children }: PropsWithChildren) {
	const router = useRouter();
	const { activeWorkspaceId } = useResourceEditor();
	const {
		activeWorkspace,
		closeWorkspace,
		isReadOnly,
		lifecycleStatus,
		openLastWorkspace,
		recoveryWorkspace,
	} = useResourceWorkspaces();
	const attemptedRestoreRef = useRef(false);

	useEffect(() => {
		if (
			lifecycleStatus !== 'manager' ||
			activeWorkspace ||
			recoveryWorkspace
		)
			return;
		if (attemptedRestoreRef.current) {
			router.replace('/');
			return;
		}
		attemptedRestoreRef.current = true;
		void openLastWorkspace().then((result) => {
			if (!result.isSuccess && !result.isLeaseConflict)
				router.replace('/');
		});
	}, [
		activeWorkspace,
		lifecycleStatus,
		openLastWorkspace,
		recoveryWorkspace,
		router,
	]);

	const returnToManager = async () => {
		await closeWorkspace();
		router.replace('/');
	};

	if (recoveryWorkspace) {
		return (
			<WorkspaceRecoveryDialog
				onContinue={() => undefined}
				onReturn={() => void returnToManager()}
			/>
		);
	}

	if (
		lifecycleStatus !== 'editing' ||
		!activeWorkspace ||
		activeWorkspaceId !== activeWorkspace.workspace.id
	) {
		return (
			<div className="mx-auto flex min-h-[50dvh] max-w-7xl items-center justify-center px-4 py-12 text-sm text-foreground-500">
				正在读取本地资源包…
			</div>
		);
	}

	return (
		<>
			{isReadOnly && (
				<div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm text-warning-700 dark:text-warning">
					当前为只读查看；如需修改，请返回资源包列表并接管编辑。
				</div>
			)}
			<div inert={isReadOnly ? true : undefined}>{children}</div>
		</>
	);
}
