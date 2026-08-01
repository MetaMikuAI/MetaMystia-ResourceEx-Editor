'use client';

import { memo, type ReactElement, type ReactNode, useState } from 'react';

import Button from '@/design/ui/components/button';
import Popover, {
	PopoverContent,
	PopoverTrigger,
} from '@/design/ui/components/popover';

interface IProps {
	trigger: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	confirmLabel?: ReactNode;
	cancelLabel?: ReactNode;
	color?: 'danger' | 'primary' | 'warning';
	isDisabled?: boolean;
	isPending?: boolean;
	isOpen?: boolean;
	onOpenChange?: (isOpen: boolean) => void;
	onConfirm: () => void;
}

export const ConfirmPopover = memo<IProps>(function ConfirmPopover({
	cancelLabel = '取消',
	color = 'danger',
	confirmLabel = '确认删除',
	description,
	isDisabled = false,
	isOpen: controlledIsOpen,
	isPending = false,
	onConfirm,
	onOpenChange,
	title,
	trigger,
}) {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const isOpen = controlledIsOpen ?? internalIsOpen;
	const setIsOpen = (nextIsOpen: boolean) => {
		if (controlledIsOpen === undefined) setInternalIsOpen(nextIsOpen);
		onOpenChange?.(nextIsOpen);
	};

	const handleConfirm = () => {
		onConfirm();
		setIsOpen(false);
	};

	return (
		<Popover
			shouldBlockScroll
			showArrow
			isOpen={isOpen}
			onOpenChange={setIsOpen}
		>
			<PopoverTrigger>{trigger}</PopoverTrigger>
			<PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-3">
				<div className="grid w-64 max-w-full gap-2">
					<p className="text-sm font-medium leading-5">{title}</p>
					{description !== undefined && (
						<p className="whitespace-pre-line text-xs leading-5 text-foreground-500">
							{description}
						</p>
					)}
					<div className="mt-1 flex justify-end gap-1">
						<Button
							size="sm"
							variant="light"
							isDisabled={isPending}
							onPress={() => setIsOpen(false)}
						>
							{cancelLabel}
						</Button>
						<Button
							color={color}
							size="sm"
							variant="flat"
							isDisabled={isDisabled}
							isLoading={isPending}
							onPress={handleConfirm}
						>
							{confirmLabel}
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
});
