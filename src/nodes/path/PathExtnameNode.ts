import { BaseNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';
import { extname, normalizePathInput } from '../../utils/PathUtils';

export class PathExtnameNode extends BaseNode {
    readonly typeId = 'fs-path-extname';
    readonly displayName = 'Path Extname';
    readonly category = { name: 'Path', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: ['core:path', 'core:string'] }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Extname', outputType: 'core:string' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'path', label: 'Path', type: 'filepath' as const, defaultValue: '' }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p = await normalizePathInput(inputs['Path']) || await normalizePathInput(properties['path']);
        return {
            'Extname': extname(p)
        };
    }
}
