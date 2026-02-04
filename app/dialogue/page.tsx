'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { DialogEditor } from '@/components/DialogEditor';
import { DialogPackageList } from '@/components/DialogPackageList';
import { Header } from '@/components/Header';

import type { Dialog, DialogPackage } from '@/types/resource';

const DEFAULT_DIALOG: Dialog = {
	characterId: 0,
	characterType: 'Special',
	pid: 0,
	position: 'Left',
	text: '',
};

export default function DialoguePage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addDialogPackage = useCallback(() => {
		const newPkg: DialogPackage = {
			name: `新对话包${data.dialogPackages.length + 1}`,
			dialogList: [],
		};
		const newPackages = [...data.dialogPackages, newPkg];
		setData({ ...data, dialogPackages: newPackages });
		setSelectedIndex(newPackages.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const removeDialogPackage = useCallback(
		(index: number) => {
			const newPackages = data.dialogPackages.filter(
				(_, i) => i !== index
			);
			setData({ ...data, dialogPackages: newPackages });
			if (selectedIndex === index) {
				setSelectedIndex(newPackages.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
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
			setData({ ...data, dialogPackages: newPackages });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
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
			setData({ ...data, dialogPackages: newPackages });
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
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
			setData({ ...data, dialogPackages: newPackages });
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
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
			setData({ ...data, dialogPackages: newPackages });
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
	);

	const selectedPackage = useMemo(
		() =>
			selectedIndex === null
				? null
				: (data.dialogPackages[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

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
		</main>
	);
}
