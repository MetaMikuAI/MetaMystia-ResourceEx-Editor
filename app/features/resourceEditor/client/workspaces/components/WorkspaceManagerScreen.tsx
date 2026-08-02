'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import Button from '@/design/ui/components/button';
import Card from '@/design/ui/components/card';
import Input from '@/design/ui/components/input';
import Modal from '@/design/ui/components/modal';

import { ConfirmDialog } from '@/features/resourceEditor/client/components/confirm/ConfirmDialog';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { SuccessBadge } from '@/features/resourceEditor/client/components/status/SuccessBadge';
import { WarningBadge } from '@/features/resourceEditor/client/components/status/WarningBadge';
import type { IWorkspaceSummary } from '@/features/resourceEditor/client/workspaces/contracts';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Asia/Shanghai',
});
const CATALOG_STATUS_CARD_CLASS_NAME =
	'mt-8 min-h-40 items-center justify-center border border-dashed border-divider bg-content1/35 px-5 py-10 text-center';

interface INotice {
	description: string;
	title: string;
}

export function WorkspaceManagerScreen() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const {
		activeWorkspace,
		createWorkspace,
		duplicateWorkspace,
		importWorkspace,
		isReadOnly,
		lifecycleStatus,
		openWorkspace,
		removeWorkspace,
		renameWorkspace,
		requestWorkspaceExport,
		retryPersistentStorage,
		saveStatus,
		storageError,
		storageMode,
		workspaces,
	} = useResourceWorkspaces();
	const [deleteTarget, setDeleteTarget] = useState<IWorkspaceSummary | null>(
		null
	);
	const [isPending, setIsPending] = useState(false);
	const [isForceDelete, setIsForceDelete] = useState(false);
	const [notice, setNotice] = useState<INotice | null>(null);
	const [renameTarget, setRenameTarget] = useState<IWorkspaceSummary | null>(
		null
	);
	const [renameValue, setRenameValue] = useState('');

	const openEditor = () => {
		router.push('/info');
	};

	const runWorkspaceOperation = async (
		operation: () => Promise<{
			error?: string;
			isLeaseConflict?: boolean;
			isSuccess: boolean;
			workspaceId?: string;
		}>,
		action: string,
		isEditorOpenExpected = false
	) => {
		setIsPending(true);
		try {
			const result = await operation();
			if (!result.isSuccess) {
				if (result.isLeaseConflict) return;
				setNotice({
					description: result.error ?? '未知错误',
					title: `${action}失败`,
				});
				return;
			}
			if (result.workspaceId && isEditorOpenExpected) openEditor();
		} catch (error) {
			setNotice({
				description:
					error instanceof Error ? error.message : String(error),
				title: `${action}失败`,
			});
		} finally {
			setIsPending(false);
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		void runWorkspaceOperation(() => importWorkspace(file), '导入资源包');
	};

	const handleRename = async () => {
		if (!renameTarget) return;
		setIsPending(true);
		const result = await renameWorkspace(renameTarget.id, renameValue);
		setIsPending(false);
		if (!result.isSuccess) {
			setNotice({
				description: result.error ?? '未知错误',
				title: '重命名失败',
			});
			return;
		}
		setRenameTarget(null);
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setIsPending(true);
		const result = await removeWorkspace(deleteTarget.id, isForceDelete);
		setIsPending(false);
		if (!result.isSuccess) {
			if (result.isLeaseConflict && !isForceDelete) {
				setIsForceDelete(true);
				return;
			}
			setDeleteTarget(null);
			setIsForceDelete(false);
			setNotice({
				description: result.error ?? '未知错误',
				title: '删除失败',
			});
			return;
		}
		setDeleteTarget(null);
		setIsForceDelete(false);
	};
	const isTemporaryStorage =
		storageMode === 'memory' || saveStatus === 'memory-only';
	const isHydrating = lifecycleStatus === 'hydrating';

	return (
		<>
			<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
				<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-2">
						<h1 className="text-2xl font-bold sm:text-3xl">
							资源包管理
						</h1>
						<p className="max-w-2xl text-sm leading-6 text-foreground-500">
							资源包保存在当前浏览器中；重要版本仍建议及时导出。
						</p>
					</div>
					<div className="grid grid-cols-2 gap-2 sm:flex">
						<Button
							variant="flat"
							isDisabled={isPending || isHydrating}
							onPress={() => fileInputRef.current?.click()}
						>
							导入资源包
						</Button>
						<Button
							color="primary"
							isLoading={
								isPending && lifecycleStatus === 'opening'
							}
							isDisabled={isPending || isHydrating}
							onPress={() =>
								void runWorkspaceOperation(
									createWorkspace,
									'新建资源包',
									true
								)
							}
						>
							新建资源包
						</Button>
					</div>
				</header>

				{!isHydrating &&
					(isTemporaryStorage || storageError !== null) && (
						<div className="mt-6 flex flex-col gap-3 rounded-large border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="font-medium text-warning-700 dark:text-warning">
									{isTemporaryStorage
										? '临时编辑'
										: '本地存储异常'}
								</p>
								<p className="mt-1 text-sm text-foreground-600">
									{isTemporaryStorage
										? storageError
											? `本地存储不可用，当前内容仅临时保留，刷新页面会丢失。原因：${storageError}`
											: '本地存储不可用，当前内容仅临时保留，刷新页面会丢失。'
										: `本地存储操作失败，警告会保留到重试成功。原因：${storageError ?? '未知错误'}`}
								</p>
							</div>
							<Button
								color="warning"
								variant="flat"
								isDisabled={isPending}
								onPress={() =>
									void runWorkspaceOperation(
										retryPersistentStorage,
										'重试本地存储'
									)
								}
							>
								重试本地存储
							</Button>
						</div>
					)}

				{isHydrating ? (
					<Card
						role="status"
						aria-live="polite"
						shadow="none"
						className={CATALOG_STATUS_CARD_CLASS_NAME}
					>
						<p className="text-sm text-foreground-500">
							正在读取本地资源包…
						</p>
					</Card>
				) : workspaces.length === 0 ? (
					<Card
						shadow="none"
						className={CATALOG_STATUS_CARD_CLASS_NAME}
					>
						<h2 className="text-lg font-semibold">还没有资源包</h2>
						<p className="mt-2 text-sm text-foreground-500">
							新建空白资源包，或者导入已有资源包开始编辑
						</p>
					</Card>
				) : (
					<div className="mt-8 grid gap-4 lg:grid-cols-2">
						{workspaces.map((workspace) => {
							const hasUnexportedChanges =
								!workspace.isCurrentExported;
							const isActive =
								activeWorkspace?.workspace.id === workspace.id;
							const localStatus =
								storageMode === 'memory'
									? '仅临时保存'
									: isActive && saveStatus === 'saving'
										? '正在保存到本机'
										: isActive && saveStatus === 'error'
											? '本地保存失败'
											: '已保存到本机';
							return (
								<Card
									key={workspace.id}
									shadow="none"
									className="border border-divider bg-content1/55 p-5 backdrop-blur"
								>
									<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0">
											<h2 className="break-words text-lg font-semibold leading-7">
												{workspace.displayName}
											</h2>
											<p className="mt-1 text-xs text-foreground-400">
												{`最后编辑：${dateTimeFormatter.format(workspace.updatedAt)}`}
											</p>
										</div>
										<div className="flex shrink-0 flex-wrap gap-1.5 sm:flex-nowrap sm:justify-end">
											{isActive && !isReadOnly && (
												<SuccessBadge className="whitespace-nowrap px-2 py-1 text-xs">
													当前编辑
												</SuccessBadge>
											)}
											{isActive && isReadOnly && (
												<WarningBadge className="whitespace-nowrap px-2 py-1 text-xs">
													只读查看
												</WarningBadge>
											)}
											{!isActive &&
												workspace.isEditing && (
													<WarningBadge className="whitespace-nowrap px-2 py-1 text-xs">
														其他页面编辑
													</WarningBadge>
												)}
											{isActive &&
											saveStatus === 'error' ? (
												<ErrorBadge className="whitespace-nowrap px-2 py-1 text-xs">
													{localStatus}
												</ErrorBadge>
											) : storageMode === 'memory' ? (
												<WarningBadge className="whitespace-nowrap px-2 py-1 text-xs">
													{localStatus}
												</WarningBadge>
											) : (
												<SuccessBadge className="whitespace-nowrap px-2 py-1 text-xs">
													{localStatus}
												</SuccessBadge>
											)}
											{hasUnexportedChanges ? (
												<WarningBadge className="whitespace-nowrap px-2 py-1 text-xs">
													未导出
												</WarningBadge>
											) : (
												<SuccessBadge className="whitespace-nowrap px-2 py-1 text-xs">
													已导出
												</SuccessBadge>
											)}
										</div>
									</div>
									<div className="mt-4 grid grid-cols-2 gap-3 rounded-medium bg-content2/45 p-3 text-sm">
										<div className="col-span-2 min-w-0">
											<span className="block text-xs text-foreground-400">
												资源包名称（Name）
											</span>
											<span className="mt-1 block break-words font-medium text-foreground-700">
												{workspace.resourcePackName ||
													'未设置'}
											</span>
										</div>
										<div className="min-w-0">
											<span className="block text-xs text-foreground-400">
												资源包标识符（Label）
											</span>
											<span className="mt-1 block truncate font-medium text-foreground-700">
												{workspace.label || '未设置'}
											</span>
										</div>
										<div className="min-w-0">
											<span className="block text-xs text-foreground-400">
												版本
											</span>
											<span className="mt-1 block truncate font-medium text-foreground-700">
												{workspace.version || '未设置'}
											</span>
										</div>
										<div className="col-span-2 min-w-0 border-t border-divider pt-3">
											<span className="block text-xs text-foreground-400">
												工作区UUID
											</span>
											<span className="mt-1 block break-all font-mono text-xs text-foreground-600">
												{workspace.id}
											</span>
										</div>
									</div>
									<div className="mt-5 space-y-2">
										<Button
											fullWidth
											color="primary"
											isDisabled={isPending}
											onPress={() =>
												void runWorkspaceOperation(
													() =>
														openWorkspace(
															workspace.id
														),
													'打开资源包',
													true
												)
											}
										>
											打开资源包
										</Button>
										<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
											<Button
												fullWidth
												variant="flat"
												isDisabled={isPending}
												onPress={() =>
													void runWorkspaceOperation(
														() =>
															requestWorkspaceExport(
																workspace.id
															),
														'导出资源包'
													)
												}
											>
												导出
											</Button>
											<Button
												fullWidth
												variant="flat"
												isDisabled={isPending}
												onPress={() =>
													void runWorkspaceOperation(
														() =>
															duplicateWorkspace(
																workspace.id
															),
														'复制资源包'
													)
												}
											>
												复制
											</Button>
											<Button
												fullWidth
												variant="flat"
												isDisabled={isPending}
												onPress={() => {
													setRenameTarget(workspace);
													setRenameValue(
														workspace.displayName
													);
												}}
											>
												重命名
											</Button>
											<Button
												fullWidth
												color="danger"
												variant="flat"
												isDisabled={isPending}
												onPress={() => {
													setIsForceDelete(false);
													setDeleteTarget(workspace);
												}}
											>
												删除
											</Button>
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".zip"
				disabled={isHydrating}
				className="hidden"
				onChange={handleFileChange}
			/>

			<Modal
				isOpen={renameTarget !== null}
				onClose={() => setRenameTarget(null)}
				size="md"
			>
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">重命名工作区</h2>
					<p className="text-sm leading-6 text-foreground-500">
						只修改用于本地识别的工作区名称，不会修改资源包内部名称（Name）。
					</p>
					<Input
						autoFocus
						label="工作区名称"
						value={renameValue}
						onValueChange={setRenameValue}
					/>
					<div className="flex justify-end gap-2 border-t border-divider pt-4">
						<Button
							variant="light"
							isDisabled={isPending}
							onPress={() => setRenameTarget(null)}
						>
							取消
						</Button>
						<Button
							color="primary"
							isLoading={isPending}
							isDisabled={!renameValue.trim()}
							onPress={() => void handleRename()}
						>
							保存
						</Button>
					</div>
				</div>
			</Modal>

			<ConfirmDialog
				isOpen={deleteTarget !== null}
				title={
					isForceDelete
						? `强制删除“${deleteTarget?.displayName ?? ''}”？`
						: `删除“${deleteTarget?.displayName ?? ''}”？`
				}
				description={
					isForceDelete
						? '仍检测到其他页面的编辑状态。强制删除会立即移除本机内容，并使其他页面无法继续保存；此操作不可撤销。'
						: '该资源包保存在本机的内容和文件都会被删除。已导出的资源包不受影响，此操作不可撤销。'
				}
				confirmLabel={isForceDelete ? '仍然删除' : '删除资源包'}
				isPending={isPending}
				onCancel={() => {
					setDeleteTarget(null);
					setIsForceDelete(false);
				}}
				onConfirm={() => void handleDelete()}
			/>
			<ConfirmDialog
				isOpen={notice !== null}
				title={notice?.title ?? ''}
				description={notice?.description}
				confirmLabel="知道了"
				onConfirm={() => setNotice(null)}
			/>
		</>
	);
}
