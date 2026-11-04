import { BaseNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';
import { dirname } from '../../utils/PathUtils';

export class PathDirnameNode extends BaseNode {
    readonly typeId = 'fs-path-dirname';
    readonly displayName = 'Path Dirname';
    readonly category = { name: 'Path', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: 'core:path' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Dirname', outputType: 'core:path' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'path', label: 'Path', type: 'filepath' as const, defaultValue: '' }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p = (inputs['Path'] ? String(inputs['Path']) : '') || (properties['path'] ? String(properties['path']) : '');
        return {
            'Dirname': dirname(p)
        };
    }
}
