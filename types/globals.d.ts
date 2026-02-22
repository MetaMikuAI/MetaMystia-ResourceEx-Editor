declare module '*.css' {}
declare module '*.scss' {}
declare module '*.pem' {
	const content: string;
	export default content;
}
