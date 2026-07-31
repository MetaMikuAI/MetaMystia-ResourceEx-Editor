'use client';

import { useCallback, useState } from 'react';

import type {
	MissionCondition,
	MissionNode,
	MissionReward,
} from '@/domain/resourcePack/contracts/mission';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import MissionEditor from './MissionEditor';
import { MissionList } from './MissionList';

const DEFAULT_MISSION = {
	title: '',
	description: '',
	debugLabel: '新任务',
	missionType: 'Kitsuna' as MissionNode['missionType'],
	sender: '',
	reciever: '', // ignore: typo
	rewards: [] as MissionReward[],
	postRewards: [] as MissionReward[],
	finishConditions: [] as MissionCondition[],
	missionFailedAction: 'None' as const,
};

export function MissionEditorScreen() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addMission = useCallback(() => {
		const packLabel = data.packInfo.label;
		const labelPrefix = packLabel ? `_${packLabel}_` : '_';
		const newMission: MissionNode = {
			...DEFAULT_MISSION,
			label: labelPrefix,
		};
		const newMissions = [...data.missionNodes, newMission];
		updateResourcePack(() => ({ ...data, missionNodes: newMissions }));
		setSelectedIndex(newMissions.length - 1);
	}, [data, updateResourcePack]);

	const updateMission = useCallback(
		(index: number | null, updates: Partial<MissionNode>) => {
			if (index === null) return;
			const newMissions = [...data.missionNodes];
			newMissions[index] = {
				...newMissions[index],
				...(updates as Partial<MissionNode>),
			} as MissionNode;
			updateResourcePack(() => ({ ...data, missionNodes: newMissions }));
		},
		[data, updateResourcePack]
	);

	const removeMission = useCallback(
		(index: number | null) => {
			if (index === null) return;
			const newMissions = data.missionNodes.filter((_, i) => i !== index);
			updateResourcePack(() => ({ ...data, missionNodes: newMissions }));
			setSelectedIndex(null);
		},
		[data, updateResourcePack]
	);

	const selectedMission =
		selectedIndex !== null && data.missionNodes[selectedIndex]
			? data.missionNodes[selectedIndex]
			: null;

	return (
		<EditorWorkspace>
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
		</EditorWorkspace>
	);
}
