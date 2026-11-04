import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';
import type { GravityDockAPI } from '@gravitydock/types';
import { PDFParse } from 'pdf-parse';
import { Buffer } from 'buffer';
import { workerData } from './workerData';

// Set the worker source using the bundled base64 string provided by pdf-parse
PDFParse.setWorker(workerData);

declare const gravityDock: GravityDockAPI;

export class ReadPdfNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-read-pdf';
    readonly displayName = 'Read PDF Text';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: 'core:path' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Content', outputType: 'core:string' }
    ];

    readonly properties: PropertyDefinition[] = [
        {
            name: 'path',
            label: 'Path',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openFile'],
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p = (inputs['Path'] ? String(inputs['Path']) : '') || (properties['path'] ? String(properties['path']) : '');
        if (!p) return { 'Content': '' };
        
        try {
            const dataBase64 = await gravityDock.fs.readFile(p, 'base64' as any);
            const parser = new PDFParse({ data: Buffer.from(dataBase64, 'base64') });
            const pdfData = await parser.getText();
            
            return { 'Content': pdfData.text };
        } catch (err) {
            console.error('ReadPdfNode error', err);
            return { 'Content': '' };
        }
    }
}
