'use client';

import { type ChangeEvent, useState } from 'react';
import type { Dialog, DialogPackage, ResourceEx } from '@/types/resource';
import { Header } from '@/components/Header';
import { useData } from '@/lib/DataContext';
import { DialogPackageList } from '@/components/DialogPackageList';
import { DialogEditor } from '@/components/DialogEditor';

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

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要覆盖吗？')
		) {
			return;
		}
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const json = JSON.parse(
					event.target?.result as string
				) as ResourceEx;
				setData(json);
				setHasUnsavedChanges(false);
			} catch (err) {
				alert('Failed to parse JSON');
			}
		};
		reader.readAsText(file);
	};

	const handleCreateBlank = () => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要清空吗？')
		) {
			return;
		}
		setData({ characters: [], dialogPackages: [] });
		setSelectedIndex(null);
		setHasUnsavedChanges(false);
	};

	const addDialogPackage = () => {
		const newPkg: DialogPackage = {
			name: `新对话包 ${data.dialogPackages.length + 1}`,
			dialogList: [],
		};
		const newPackages = [...data.dialogPackages, newPkg];
		setData({ ...data, dialogPackages: newPackages });
		setSelectedIndex(newPackages.length - 1);
		setHasUnsavedChanges(true);
	};

	const removeDialogPackage = (index: number) => {
		const newPackages = data.dialogPackages.filter((_, i) => i !== index);
		setData({ ...data, dialogPackages: newPackages });
		if (selectedIndex === index) {
			setSelectedIndex(newPackages.length > 0 ? 0 : null);
		} else if (selectedIndex !== null && selectedIndex > index) {
			setSelectedIndex(selectedIndex - 1);
		}
		setHasUnsavedChanges(true);
	};

	const updateDialogPackage = (
		index: number,
		updates: Partial<DialogPackage>
	) => {
		const newPackages = [...data.dialogPackages];
		newPackages[index] = {
			...newPackages[index],
			...updates,
		} as DialogPackage;
		setData({ ...data, dialogPackages: newPackages });
		setHasUnsavedChanges(true);
	};

	const addDialog = (insertIndex?: number) => {
		if (selectedIndex === null) return;
		const newPackages = [...data.dialogPackages];
		const pkg = newPackages[selectedIndex];
		if (!pkg) return;

		// 确定参考对话的索引
		let refDialogIndex: number | null = null;
		if (insertIndex !== undefined) {
			// 插入位置的前一条对话
			refDialogIndex = insertIndex > 0 ? insertIndex - 1 : null;
		} else {
			// 没有指定位置，使用最后一条对话
			refDialogIndex =
				pkg.dialogList.length > 0 ? pkg.dialogList.length - 1 : null;
		}

		// 创建新对话，沿用参考对话的设置，对话内容为空
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

		// 插入对话
		if (insertIndex !== undefined) {
			pkg.dialogList.splice(insertIndex, 0, newDialog);
		} else {
			pkg.dialogList = [...pkg.dialogList, newDialog];
		}
		setData({ ...data, dialogPackages: newPackages });
		setHasUnsavedChanges(true);
	};

	const removeDialog = (dialogIndex: number) => {
		if (selectedIndex === null) return;
		if (!confirm('确定要删除这条对话吗？')) return;
		const newPackages = [...data.dialogPackages];
		const pkg = newPackages[selectedIndex];
		if (!pkg) return;
		pkg.dialogList = pkg.dialogList.filter((_, i) => i !== dialogIndex);
		setData({ ...data, dialogPackages: newPackages });
		setHasUnsavedChanges(true);
	};

	const updateDialog = (dialogIndex: number, updates: Partial<Dialog>) => {
		if (selectedIndex === null) return;
		const newPackages = [...data.dialogPackages];
		const pkg = newPackages[selectedIndex];
		if (!pkg) return;
		pkg.dialogList[dialogIndex] = {
			...pkg.dialogList[dialogIndex],
			...updates,
		} as Dialog;
		setData({ ...data, dialogPackages: newPackages });
		setHasUnsavedChanges(true);
	};

	const selectedPackage =
		selectedIndex !== null
			? (data.dialogPackages[selectedIndex] ?? null)
			: null;

	const downloadJson = () => {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ResourceEx.json';
		a.click();
		URL.revokeObjectURL(url);
		setHasUnsavedChanges(false);
	};

	return (
		<main className="flex min-h-screen flex-col">
			<Header
				onCreateBlank={handleCreateBlank}
				onFileUpload={handleFileUpload}
				onDownload={downloadJson}
				currentPage="dialogue"
			/>

			<div className="mx-auto w-full max-w-6xl p-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					<DialogPackageList
						packages={data.dialogPackages}
						selectedIndex={selectedIndex}
						onSelect={setSelectedIndex}
						onAdd={addDialogPackage}
						onRemove={removeDialogPackage}
					/>

					<DialogEditor
						dialogPackage={selectedPackage}
						allPackages={data.dialogPackages}
						packageIndex={selectedIndex}
						onUpdate={(updates) =>
							updateDialogPackage(selectedIndex!, updates)
						}
						onRemoveDialog={removeDialog}
						onAddDialog={addDialog}
						onUpdateDialog={updateDialog}
					/>
				</div>
			</div>
		</main>
	);
}
