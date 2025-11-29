import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads') // This will be at /api/uploads/ due to global prefix
export class FilesController {
  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      console.log(`[FilesController] Request for file: ${filename}`);
      
      // Security: Only allow alphanumeric, dots, dashes, and underscores in filename
      if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
        console.error(`[FilesController] Invalid filename: ${filename}`);
        throw new NotFoundException('Invalid filename');
      }

      // Try multiple possible paths
      const possiblePaths = [
        join(process.cwd(), 'uploads', filename),
        join(__dirname, '..', '..', 'uploads', filename),
        join(__dirname, '..', 'uploads', filename),
      ];
      
      let filePath: string | null = null;
      for (const path of possiblePaths) {
        console.log(`[FilesController] Checking path: ${path}`);
        if (existsSync(path)) {
          filePath = path;
          console.log(`[FilesController] File found at: ${filePath}`);
          break;
        }
      }
      
      if (!filePath) {
        console.error(`[FilesController] File not found in any location. Tried:`, possiblePaths);
        throw new NotFoundException(`File ${filename} not found`);
      }

      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      const contentTypeMap: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
      };

      const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

      // Set headers for file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for file downloads
      
      // Send file
      res.sendFile(filePath);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error serving file:', error);
      throw new NotFoundException(`Error serving file: ${error}`);
    }
  }
}

