'use client';

import { useCallback, useMemo, useState } from 'react';

import { DialogEditor } from '@/components/dialog/DialogEditor';
import { DialogPackageList } from '@/components/dialog/DialogPackageList';

import type {
	Dialog,
	DialogPackage,
} from '@/domain/resourcePack/contracts/dialogue';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

const DEFAULT_DIALOG: Dialog = {
	characterId: 0,
	characterType: 'Special',
	pid: 0,
	position: 'Left',
	text: '',
};

export default function DialoguePage() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addDialogPackage = useCallback(() => {
		const packLabel = data.packInfo.label;
		const namePrefix = packLabel ? `_${packLabel}_` : '_';
		const newPkg: DialogPackage = {
			name: `${namePrefix}Dialog_${data.dialogPackages.length + 1}`,
			dialogList: [],
		};
		const newPackages = [...data.dialogPackages, newPkg];
		updateResourcePack(() => ({ ...data, dialogPackages: newPackages }));
		setSelectedIndex(newPackages.length - 1);
	}, [data, updateResourcePack]);

	const removeDialogPackage = useCallback(
		(index: number) => {
			const newPackages = data.dialogPackages.filter(
				(_, i) => i !== index
			);
			updateResourcePack(() => ({
				...data,
				dialogPackages: newPackages,
			}));
			if (selectedIndex === index) {
				setSelectedIndex(newPackages.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, selectedIndex, updateResourcePack]
	);

	const updateDialogPackage = useCallback(
		(index: number | null, updates: Partial<DialogPackage>) => {
			if (index === null) {
				return;
			}
			const newPackages = [...data.dialogPackages];
			newPackages[index] = {
				...newPackages[index],
				...updates,
			} as DialogPackage;
			updateResourcePack(() => ({
				...data,
				dialogPackages: newPackages,
			}));
		},
		[data, updateResourcePack]
	);

	const addDialog = useCallback(
		(
			insertIndex?: number,
			searchPosition?: Dialog['position'] | 'recent'
		) => {
			if (selectedIndex === null) {
				return;
			}

			const newPackages = [...data.dialogPackages];
			const pkg = newPackages[selectedIndex];
			if (!pkg) {
				return;
			}

			let refDialog: Dialog | null = null;

			// 根据 searchPosition 查找模板对话
			if (searchPosition && searchPosition !== 'recent') {
				// 搜索指定位置的最近对话
				const searchStart =
					insertIndex !== undefined
						? insertIndex - 1
						: pkg.dialogList.length - 1;
				for (let i = searchStart; i >= 0; i--) {
					const dialog = pkg.dialogList[i];
					if (dialog?.position === searchPosition) {
						refDialog = dialog;
						break;
					}
				}
			} else {
				// 默认行为：使用最近的对话
				let refDialogIndex: number | null = null;
				if (insertIndex !== undefined) {
					refDialogIndex = insertIndex > 0 ? insertIndex - 1 : null;
				} else {
					refDialogIndex =
						pkg.dialogList.length > 0
							? pkg.dialogList.length - 1
							: null;
				}
				refDialog =
					refDialogIndex !== null
						? (pkg.dialogList[refDialogIndex] ?? null)
						: null;
			}

			const newDialog: Dialog = refDialog
				? {
						characterId: refDialog.characterId,
						characterType: refDialog.characterType,
						pid: refDialog.pid,
						position: refDialog.position,
						text: '',
					}
				: {
						...DEFAULT_DIALOG,
						position:
							searchPosition && searchPosition !== 'recent'
								? searchPosition
								: DEFAULT_DIALOG.position,
					};

			if (insertIndex !== undefined) {
				pkg.dialogList.splice(insertIndex, 0, newDialog);
			} else {
				pkg.dialogList = [...pkg.dialogList, newDialog];
			}
			updateResourcePack(() => ({
				...data,
				dialogPackages: newPackages,
			}));
		},
		[data, selectedIndex, updateResourcePack]
	);

	const removeDialog = useCallback(
		(dialogIndex: number) => {
			if (selectedIndex === null) {
				return;
			}
			if (!confirm('确定要删除这条对话吗？此操作不可撤销。')) {
				return;
			}

			const newPackages = [...data.dialogPackages];
			const pkg = newPackages[selectedIndex];
			if (!pkg) {
				return;
			}

			pkg.dialogList = pkg.dialogList.filter((_, i) => i !== dialogIndex);
			updateResourcePack(() => ({
				...data,
				dialogPackages: newPackages,
			}));
		},
		[data, selectedIndex, updateResourcePack]
	);

	const updateDialog = useCallback(
		(dialogIndex: number, updates: Partial<Dialog>) => {
			if (selectedIndex === null) {
				return;
			}

			const newPackages = [...data.dialogPackages];
			const pkg = newPackages[selectedIndex];
			if (!pkg) {
				return;
			}

			pkg.dialogList[dialogIndex] = {
				...pkg.dialogList[dialogIndex],
				...updates,
			} as Dialog;
			updateResourcePack(() => ({
				...data,
				dialogPackages: newPackages,
			}));
		},
		[data, selectedIndex, updateResourcePack]
	);

	const selectedPackage = useMemo(
		() =>
			selectedIndex === null
				? null
				: (data.dialogPackages[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<div className="flex flex-col">
			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<DialogPackageList
						packages={data.dialogPackages}
						selectedIndex={selectedIndex}
						onAdd={addDialogPackage}
						onRemove={removeDialogPackage}
						onSelect={setSelectedIndex}
					/>

					<DialogEditor
						allPackages={data.dialogPackages}
						dialogPackage={selectedPackage}
						packageIndex={selectedIndex}
						onAddDialog={addDialog}
						onRemoveDialog={removeDialog}
						onUpdate={(updates) => {
							updateDialogPackage(selectedIndex, updates);
						}}
						onUpdateDialog={updateDialog}
					/>
				</div>
			</div>
		</div>
	);
}
