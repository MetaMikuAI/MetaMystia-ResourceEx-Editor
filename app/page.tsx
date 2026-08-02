import { WorkspaceManagerScreen } from '@/features/resourceEditor/client/workspaces/components/WorkspaceManagerScreen';

export default function Home() {
	return (
		<>
			<WorkspaceManagerScreen />
			<noscript>请启用JavaScript以管理和编辑本地资源包。</noscript>
		</>
	);
}
