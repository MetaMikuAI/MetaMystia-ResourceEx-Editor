'use client';

import { useState } from 'react';

import Button from '@/design/ui/components/button';

import { CoordinatedModal, pushOverlayChild } from '@/features/overlays/client';
import { ConfirmDialog } from '@/features/resourceEditor/client/components/confirm/ConfirmDialog';
import type { IWorkspaceOperationResult } from '@/features/resourceEditor/client/workspaces/contracts';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

interface IProps {
	onContinue(): void;
	onReturn(): Promise<IWorkspaceOperationResult>;
}

export function WorkspaceRecoveryDialog({ onContinue, onReturn }: IProps) {
	const { continueRecovery, discardRecovery, recoveryWorkspace } =
		useResourceWorkspaces();
	const [error, setError] = useState<string | null>(null);
	const [isDiscarding, setIsDiscarding] = useState(false);
	const [isReturning, setIsReturning] = useState(false);
	const [isDiscardConfirmationOpen, setIsDiscardConfirmationOpen] =
		useState(false);

	if (!recoveryWorkspace) return null;

	const handleContinue = () => {
		continueRecovery();
		onContinue();
	};

	const handleDiscard = async () => {
		setIsDiscardConfirmationOpen(false);
		setIsDiscarding(true);
		setError(null);
		const result = await discardRecovery();
		setIsDiscarding(false);
		if (!result.isSuccess) {
			setError(result.error ?? '无法放弃本地修改');
			return;
		}
		onContinue();
	};

	const handleReturn = async () => {
		setIsReturning(true);
		setError(null);
		try {
			const result = await onReturn();
			if (!result.isSuccess) {
				setError(result.error ?? '无法结束当前编辑');
			}
		} catch (returnError) {
			setError(
				returnError instanceof Error
					? returnError.message
					: String(returnError)
			);
		} finally {
			setIsReturning(false);
		}
	};

	return (
		<>
			<CoordinatedModal
				coordination={{ id: 'workspace.recovery' }}
				hideCloseButton
				isDismissable={false}
				isKeyboardDismissDisabled
				isOpen
				size="lg"
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<h2 className="text-xl font-semibold">
							发现未导出的本地修改
						</h2>
						<p className="text-sm leading-6 text-foreground-600">
							{`“${recoveryWorkspace.displayName}”有导入或上次导出之后的本地修改。建议继续编辑；放弃后将恢复到上次导出或导入的版本。`}
						</p>
						{error && (
							<p className="text-sm text-danger">{error}</p>
						)}
					</div>
					<div className="flex flex-col-reverse gap-2 border-t border-divider pt-4 sm:flex-row sm:justify-end">
						<Button
							variant="light"
							isDisabled={isDiscarding || isReturning}
							isLoading={isReturning}
							onPress={() => void handleReturn()}
						>
							返回资源包列表
						</Button>
						<Button
							color="danger"
							variant="flat"
							isDisabled={isReturning}
							isLoading={isDiscarding}
							onPress={() =>
								pushOverlayChild({
									childId: 'workspace.recovery.discard',
									onOpenChild: () =>
										setIsDiscardConfirmationOpen(true),
									parentId: 'workspace.recovery',
								})
							}
						>
							放弃本地修改
						</Button>
						<Button
							color="primary"
							isDisabled={isDiscarding || isReturning}
							onPress={handleContinue}
						>
							继续编辑
						</Button>
					</div>
				</div>
			</CoordinatedModal>
			<ConfirmDialog
				coordinationId="workspace.recovery.discard"
				isOpen={isDiscardConfirmationOpen}
				title="放弃本地修改？"
				description="资源包将恢复到上次导出或导入的版本，之后无法找回这些本地修改。"
				confirmLabel="确认放弃"
				isPending={isDiscarding || isReturning}
				onCancel={() => setIsDiscardConfirmationOpen(false)}
				onConfirm={() => void handleDiscard()}
			/>
		</>
	);
}
