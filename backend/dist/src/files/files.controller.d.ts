import type { Response } from 'express';
export declare class FilesController {
    serveFile(filename: string, res: Response): Promise<void>;
}
