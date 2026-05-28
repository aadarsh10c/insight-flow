import type { ShellView, UseShellParams } from './shell.type'

export const useShell = ({ children }: UseShellParams): ShellView => ({ children })
