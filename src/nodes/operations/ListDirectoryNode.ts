import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

import { join, normalizePathInput } from '../../utils/PathUtils';

export class ListDirectoryNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-list-dir';
    readonly displayName = 'List Directory';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: ['core:path', 'core:string'] }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Files', outputType: 'core:path-array' }
    ];

    readonly properties: PropertyDefinition[] = [
        {
            name: 'path',
            label: 'Path',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openDirectory']
        },
        {
            name: 'recursive',
            label: 'Recursive',
            type: 'boolean' as const,
            defaultValue: false
        }
    ];

    private async listRecursive(dir: string, onTopProgress?: (done: number, total: number) => void): Promise<string[]> {
        const entries = await gravityDock.fs.listDir(dir);
        const results: string[] = [];

        for (let i = 0; i < entries.length; i++) {
            const fullPath = join(dir, String(entries[i]));
            results.push(fullPath);

            try {
                const stat = await gravityDock.fs.stat(fullPath);
                const isDir = typeof stat?.isDirectory === 'function'
                    ? stat.isDirectory()
                    : Boolean(stat?.isDirectory);
                if (isDir) {
                    const nested = await this.listRecursive(fullPath);
                    results.push(...nested);
                }
            } catch {
                // Ignore entries that cannot be statted
            }

            if (onTopProgress) {
                onTopProgress(i + 1, entries.length);
            }
        }

        return results;
    }

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p = await normalizePathInput(inputs['Path']) || await normalizePathInput(properties['path']);
        if (!p) return { 'Files': [] };

        const recursive = Boolean(properties['recursive']);

        try {
            if (recursive) {
                const progressFn = (gravityDock as any).progress;
                const files = await this.listRecursive(
                    p,
                    typeof progressFn === 'function'
                        ? (done, total) => { if (total > 10) progressFn(done, total); }
                        : undefined
                );
                return { 'Files': files };
            }

            const files = await gravityDock.fs.listDir(p);
            const absoluteFiles = files.map((f: string) => join(p, f));
            return { 'Files': absoluteFiles };
        } catch (err: any) {
            const msg = err && err.message ? err.message : String(err);
            const wrapped = new Error(`List Directory failed for '${p}': ${msg}`) as Error & { hint?: string };
            wrapped.hint = 'Verify the directory path exists and is readable';
            throw wrapped;
        }
    }
}
