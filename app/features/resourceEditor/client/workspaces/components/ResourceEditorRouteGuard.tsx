'use client';

import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';

import Button from '@/design/ui/components/button';
import Card from '@/design/ui/components/card';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';
import { WorkspaceRecoveryDialog } from '@/features/resourceEditor/client/workspaces/components/WorkspaceRecoveryDialog';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

interface IRestoreFallback {
	error?: string;
}

export function ResourceEditorRouteGuard({ children }: PropsWithChildren) {
	const router = useRouter();
	const { activeWorkspaceId } = useResourceEditor();
	const {
		activeWorkspace,
		closeWorkspace,
		isReadOnly,
		leaseConflict,
		lifecycleStatus,
		openLastWorkspace,
		openWorkspace,
		recoveryWorkspace,
		workspaces,
	} = useResourceWorkspaces();
	const attemptedRestoreRef = useRef(false);
	const [openingWorkspaceId, setOpeningWorkspaceId] = useState<string | null>(
		null
	);
	const [restoreFallback, setRestoreFallback] =
		useState<IRestoreFallback | null>(null);

	useEffect(() => {
		if (
			lifecycleStatus !== 'manager' ||
			activeWorkspace ||
			leaseConflict ||
			recoveryWorkspace
		)
			return;
		if (attemptedRestoreRef.current) return;
		attemptedRestoreRef.current = true;
		void openLastWorkspace().then((result) => {
			if (!result.isSuccess && !result.isLeaseConflict) {
				setRestoreFallback({});
			}
		});
	}, [
		activeWorkspace,
		leaseConflict,
		lifecycleStatus,
		openLastWorkspace,
		recoveryWorkspace,
	]);

	const handleOpenWorkspace = async (workspaceId: string) => {
		setOpeningWorkspaceId(workspaceId);
		setRestoreFallback(null);
		const result = await openWorkspace(workspaceId);
		setOpeningWorkspaceId(null);
		if (!result.isSuccess && !result.isLeaseConflict) {
			setRestoreFallback({ error: result.error ?? '无法打开资源包' });
		}
	};

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

	if (lifecycleStatus === 'manager' && restoreFallback) {
		return (
			<div className="mx-auto flex min-h-[50dvh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
				<Card
					shadow="none"
					className="w-full border border-divider bg-content1/55 p-5 backdrop-blur sm:p-6"
				>
					{workspaces.length > 0 ? (
						<>
							<h1 className="text-xl font-semibold">
								选择要编辑的资源包
							</h1>
							<p className="mt-2 text-sm leading-6 text-foreground-500">
								这个标签页尚未选择工作区。选择后会留在当前页面继续打开。
							</p>
							{restoreFallback.error && (
								<p className="mt-3 text-sm text-danger">
									{restoreFallback.error}
								</p>
							)}
							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								{workspaces.map((workspace) => (
									<Button
										key={workspace.id}
										fullWidth
										variant="bordered"
										className="h-auto min-h-16 justify-start px-4 py-3 text-left"
										isDisabled={openingWorkspaceId !== null}
										isLoading={
											openingWorkspaceId === workspace.id
										}
										onPress={() =>
											void handleOpenWorkspace(
												workspace.id
											)
										}
									>
										<span className="flex min-w-0 flex-col items-start gap-0.5">
											<span className="max-w-full truncate font-semibold">
												{workspace.displayName}
											</span>
											<span className="max-w-full truncate text-xs font-normal text-foreground-500">
												{workspace.resourcePackName ||
													'资源包名称未设置'}
												{workspace.version
													? `·${workspace.version}`
													: ''}
											</span>
										</span>
									</Button>
								))}
							</div>
						</>
					) : (
						<>
							<h1 className="text-xl font-semibold">
								当前浏览器中还没有资源包
							</h1>
							<p className="mt-2 text-sm leading-6 text-foreground-500">
								请先前往资源包管理页面新建或导入资源包。
							</p>
						</>
					)}
					<div className="mt-5 flex justify-end border-t border-divider pt-4">
						<Button variant="flat" onPress={() => router.push('/')}>
							前往资源包管理
						</Button>
					</div>
				</Card>
			</div>
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
