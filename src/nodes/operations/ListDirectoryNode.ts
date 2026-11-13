import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

import { join } from '../../utils/PathUtils';

export class ListDirectoryNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-list-dir';
    readonly displayName = 'List Directory';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: 'core:path' }
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

    private async listRecursive(dir: string): Promise<string[]> {
        const entries = await gravityDock.fs.listDir(dir);
        const results: string[] = [];

        for (const entry of entries) {
            const fullPath = join(dir, String(entry));
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
        }

        return results;
    }

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p = (inputs['Path'] ? String(inputs['Path']) : '') || (properties['path'] ? String(properties['path']) : '');
        if (!p) return { 'Files': [] };

        const recursive = Boolean(properties['recursive']);

        try {
            if (recursive) {
                const files = await this.listRecursive(p);
                return { 'Files': files };
            }

            const files = await gravityDock.fs.listDir(p);
            const absoluteFiles = files.map((f: string) => join(p, f));
            return { 'Files': absoluteFiles };
        } catch (err) {
            console.error('ListDirectory error', err);
            return { 'Files': [] };
        }
    }
}
