'use client';

import { type ChangeEvent, useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { DialogEditor } from '@/components/DialogEditor';
import { DialogPackageList } from '@/components/DialogPackageList';
import { Header } from '@/components/Header';

import type { Dialog, DialogPackage, ResourceEx } from '@/types/resource';

const DEFAULT_DIALOG: Dialog = {
	characterId: 0,
	characterType: 'Special',
	pid: 0,
	position: 'Left',
	text: '',
};

export default function DialoguePage() {
	const { data, setData, hasUnsavedChanges, setHasUnsavedChanges } =
		useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const handleFileUpload = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (
				hasUnsavedChanges &&
				!confirm('当前有未保存的更改，确定要覆盖吗？')
			) {
				return;
			}

			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			const reader = new FileReader();

			reader.addEventListener('load', (event) => {
				try {
					const json = JSON.parse(
						event.target?.result as string
					) as ResourceEx;
					setData(json);
					setHasUnsavedChanges(false);
				} catch {
					alert('无法读取文件，请确保文件格式正确。');
				}
			});

			reader.readAsText(file);
		},
		[hasUnsavedChanges, setData, setHasUnsavedChanges]
	);

	const handleCreateBlank = useCallback(() => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要清空吗？')
		) {
			return;
		}
		setData({ characters: [], dialogPackages: [] });
		setSelectedIndex(null);
		setHasUnsavedChanges(false);
	}, [hasUnsavedChanges, setData, setHasUnsavedChanges]);

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
		(insertIndex?: number) => {
			if (selectedIndex === null) {
				return;
			}

			const newPackages = [...data.dialogPackages];
			const pkg = newPackages[selectedIndex];
			if (!pkg) {
				return;
			}

			let refDialogIndex: number | null = null;
			if (insertIndex !== undefined) {
				refDialogIndex = insertIndex > 0 ? insertIndex - 1 : null;
			} else {
				refDialogIndex =
					pkg.dialogList.length > 0
						? pkg.dialogList.length - 1
						: null;
			}

			const refDialog =
				refDialogIndex !== null ? pkg.dialogList[refDialogIndex] : null;
			const newDialog: Dialog = refDialog
				? {
						characterId: refDialog.characterId,
						characterType: refDialog.characterType,
						pid: refDialog.pid,
						position: refDialog.position,
						text: '',
					}
				: { ...DEFAULT_DIALOG };

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

	const downloadJson = useCallback(() => {
		const exportData = {
			...data,
			characters: data.characters.map((char) => {
				if (!char.guest) {
					return char;
				}
				const activeLikeFoodTagIds = char.guest.likeFoodTag.map(
					(t) => t.tagId
				);
				const activeLikeBevTagIds = char.guest.likeBevTag.map(
					(t) => t.tagId
				);
				return {
					...char,
					guest: {
						...char.guest,
						foodRequests: char.guest.foodRequests.filter(
							({ tagId }) => activeLikeFoodTagIds.includes(tagId)
						),
						bevRequests: (char.guest.bevRequests || []).filter(
							({ tagId }) => activeLikeBevTagIds.includes(tagId)
						),
					},
				};
			}),
		};
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ResourceEx.json';
		a.click();
		URL.revokeObjectURL(url);
		setHasUnsavedChanges(false);
	}, [data, setHasUnsavedChanges]);

	return (
		<main className="flex min-h-screen flex-col">
			<Header
				onCreateBlank={handleCreateBlank}
				onDownload={downloadJson}
				onFileUpload={handleFileUpload}
			/>

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
