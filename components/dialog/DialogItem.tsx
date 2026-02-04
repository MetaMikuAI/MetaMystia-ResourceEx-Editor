import { memo } from 'react';

import { useData } from '@/components/DataContext';
import { DialogFormFields } from '@/components/dialog/DialogFormFields';
import { DialogItemHeader } from '@/components/dialog/DialogItemHeader';
import { PortraitPreview } from '@/components/dialog/PortraitPreview';
import { useDialogDisplay } from '@/components/dialog/useDialogDisplay';

import type { Character, Dialog } from '@/types/resource';

interface DialogItemProps {
	dialog: Dialog;
	index: number;
	onUpdate: (updates: Partial<Dialog>) => void;
	onRemove: () => void;
	customCharacters: Character[];
}

export const DialogItem = memo<DialogItemProps>(function DialogItem({
	customCharacters,
	dialog,
	index,
	onRemove,
	onUpdate,
}) {
	const { portraitPath, charName, portraitName } = useDialogDisplay(
		dialog,
		customCharacters
	);

	return (
		<div className="relative flex flex-col gap-4 rounded-lg bg-white/40 p-4 shadow-sm dark:bg-white/5">
			{/* Position indicator stripe */}
			<div
				className={`absolute top-0 h-full w-1 ${
					dialog.position === 'Left'
						? 'left-0 rounded-l-lg bg-blue-500'
						: 'right-0 rounded-r-lg bg-orange-500'
				}`}
				title={`位置: ${dialog.position === 'Left' ? '左侧' : '右侧'}`}
			/>
			<DialogItemHeader
				index={index}
				position={dialog.position}
				onRemove={onRemove}
				onTogglePosition={() => {
					onUpdate({
						position: dialog.position === 'Left' ? 'Right' : 'Left',
					});
				}}
			/>
			<div className="flex flex-col gap-6 md:flex-row">
				<div className="w-full shrink-0 md:w-56">
					<PortraitPreview
						portraitPath={portraitPath}
						characterId={dialog.characterId}
						charName={charName}
						pid={dialog.pid}
						portraitName={portraitName}
					/>
				</div>
				<DialogFormFields
					dialog={dialog}
					customCharacters={customCharacters}
					onUpdate={onUpdate}
				/>
			</div>
		</div>
	);
});

export const DialogItemWrapper = memo<
	Omit<DialogItemProps, 'customCharacters'>
>(function DialogItemWrapper({ dialog, index, onRemove, onUpdate }) {
	const { data } = useData();

	return (
		<DialogItem
			customCharacters={data.characters}
			dialog={dialog}
			index={index}
			onRemove={onRemove}
			onUpdate={onUpdate}
		/>
	);
});
