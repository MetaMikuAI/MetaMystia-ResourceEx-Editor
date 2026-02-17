'use client';

import { useCallback, useState } from 'react';
import { useData } from '@/components/context/DataContext';
import { Header } from '@/components/common/Header';
import { MissionList } from '@/components/mission/MissionList';
import MissionEditor from '@/components/mission/MissionEditor';
import type {
	MissionNode,
	MissionReward,
	MissionCondition,
} from '@/types/resource';

const DEFAULT_MISSION = {
	title: '',
	description: '',
	debugLabel: '新任务',
	missionType: 'Kitsuna' as MissionNode['missionType'],
	sender: '',
	reciever: '', // ignore: typo
	rewards: [] as MissionReward[],
	finishConditions: [] as MissionCondition[],
};

export default function MissionPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addMission = useCallback(() => {
		const packLabel = data.packInfo.label;
		const labelPrefix = packLabel ? `_${packLabel}_` : '_';
		const newMission: MissionNode = {
			...DEFAULT_MISSION,
			label: labelPrefix,
		};
		const newMissions = [...data.missionNodes, newMission];
		setData({ ...data, missionNodes: newMissions });
		setSelectedIndex(newMissions.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const updateMission = useCallback(
		(index: number | null, updates: Partial<MissionNode>) => {
			if (index === null) return;
			const newMissions = [...data.missionNodes];
			newMissions[index] = {
				...newMissions[index],
				...(updates as Partial<MissionNode>),
			} as MissionNode;
			setData({ ...data, missionNodes: newMissions });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const removeMission = useCallback(
		(index: number | null) => {
			if (index === null) return;
			if (!confirm('确定要删除这个任务节点吗？')) return;

			const newMissions = data.missionNodes.filter((_, i) => i !== index);
			setData({ ...data, missionNodes: newMissions });
			setSelectedIndex(null);
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedMission =
		selectedIndex !== null && data.missionNodes[selectedIndex]
			? data.missionNodes[selectedIndex]
			: null;

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<MissionList
						missions={data.missionNodes}
						selectedIndex={selectedIndex}
						onAdd={addMission}
						onSelect={setSelectedIndex}
					/>

					<div className="lg:col-span-2">
						<MissionEditor
							mission={selectedMission}
							characters={data.characters || []}
							foods={data.foods || []}
							ingredients={data.ingredients || []}
							beverages={data.beverages || []}
							recipes={data.recipes || []}
							allMissions={data.missionNodes || []}
							allEvents={data.eventNodes || []}
							allDialogPackages={data.dialogPackages || []}
							onRemove={() => removeMission(selectedIndex)}
							onUpdate={(updates) =>
								updateMission(selectedIndex, updates)
							}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
