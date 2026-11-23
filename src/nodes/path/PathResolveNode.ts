import { BaseNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';
import { normalizePathInput, resolve } from '../../utils/PathUtils';

export class PathResolveNode extends BaseNode {
    readonly typeId = 'fs-path-resolve';
    readonly displayName = 'Path Resolve';
    readonly category = { name: 'Path', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path 1', acceptsType: ['core:path', 'core:string'] },
        { name: 'Path 2', acceptsType: ['core:path', 'core:string'] }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Path', outputType: 'core:path' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'path1', label: 'Path 1', type: 'filepath' as const, defaultValue: '' },
        { name: 'path2', label: 'Path 2', type: 'filepath' as const, defaultValue: '' }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p1 = await normalizePathInput(inputs['Path 1']) || await normalizePathInput(properties['path1']);
        const p2 = await normalizePathInput(inputs['Path 2']) || await normalizePathInput(properties['path2']);
        return {
            'Path': resolve(p1, p2)
        };
    }
}
