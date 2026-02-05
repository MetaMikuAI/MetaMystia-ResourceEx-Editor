import { memo } from 'react';
import type { DialogPackage } from '@/types/resource';
import { DialogItem } from './DialogItem';

interface DialogArrayFieldProps {
	label: string;
	dialogs: string[];
	allDialogPackages: DialogPackage[];
	onAdd: (dialogName: string) => void;
	onRemove: (index: number) => void;
}

export const DialogArrayField = memo<DialogArrayFieldProps>(
	function DialogArrayField({
		label,
		dialogs,
		allDialogPackages,
		onAdd,
		onRemove,
	}) {
		return (
			<div className="flex flex-col gap-2">
				<label className="text-sm font-bold opacity-70">{label}</label>
				<div className="flex flex-col gap-2">
					{/* Dialog List */}
					{dialogs.length > 0 && (
						<div className="flex flex-col gap-1">
							{dialogs.map((dialog, idx) => (
								<DialogItem
									key={idx}
									dialog={dialog}
									onRemove={() => onRemove(idx)}
								/>
							))}
						</div>
					)}
					{/* Add Dialog Dropdown */}
					<select
						onChange={(e) => {
							onAdd(e.target.value);
							e.target.value = '';
						}}
						className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
						defaultValue=""
					>
						<option value="" disabled>
							添加对话包...
						</option>
						{allDialogPackages.map((d) => (
							<option
								key={d.name}
								value={d.name}
								disabled={dialogs.includes(d.name)}
							>
								{d.name}
							</option>
						))}
					</select>
				</div>
			</div>
		);
	}
);
