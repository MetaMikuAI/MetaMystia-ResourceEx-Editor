'use client';

import { memo, type ReactNode } from 'react';

import Button from '@/design/ui/components/button';

import { CoordinatedModal } from '@/features/overlays/client';
import type { TOverlayId } from '@/features/overlays/contracts';

interface IProps {
	coordinationId: TOverlayId;
	isOpen: boolean;
	title: ReactNode;
	description?: ReactNode;
	confirmLabel?: ReactNode;
	cancelLabel?: ReactNode;
	color?: 'danger' | 'primary' | 'warning';
	isConfirmDisabled?: boolean;
	isPending?: boolean;
	onCancel?: () => void;
	onConfirm: () => void;
}

export const ConfirmDialog = memo<IProps>(function ConfirmDialog({
	cancelLabel = '取消',
	color = 'danger',
	confirmLabel = '确认',
	coordinationId,
	description,
	isConfirmDisabled = false,
	isOpen,
	isPending = false,
	onCancel,
	onConfirm,
	title,
}) {
	const handleClose = onCancel ?? onConfirm;

	return (
		<CoordinatedModal
			coordination={{ id: coordinationId }}
			isOpen={isOpen}
			onClose={handleClose}
			isDismissable={!isPending}
			isKeyboardDismissDisabled={isPending}
			size="md"
		>
			<div className="flex flex-col gap-4">
				<div className="space-y-2">
					<h2 className="text-lg font-semibold">{title}</h2>
					{description !== undefined && (
						<div className="whitespace-pre-line text-sm leading-6 text-foreground-600">
							{description}
						</div>
					)}
				</div>
				<div className="flex justify-end gap-2 border-t border-divider pt-4">
					{onCancel !== undefined && (
						<Button
							variant="light"
							isDisabled={isPending}
							onPress={onCancel}
						>
							{cancelLabel}
						</Button>
					)}
					<Button
						color={color}
						isDisabled={isConfirmDisabled}
						isLoading={isPending}
						onPress={onConfirm}
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</CoordinatedModal>
	);
});
