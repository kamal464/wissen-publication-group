import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

// This controller handles /uploads/:filename (without /api prefix)
// It's excluded from global prefix in main.ts
@Controller('uploads')
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

      // Try multiple possible paths (Cloud Run uses different paths than local)
      const possiblePaths = [
        // Production: files are in /app/uploads (Docker working directory)
        join('/app', 'uploads', filename),
        // Production: relative to dist
        join(__dirname, '..', '..', 'uploads', filename),
        join(__dirname, '..', 'uploads', filename),
        // Development: relative to process.cwd()
        join(process.cwd(), 'uploads', filename),
        // Fallback: absolute path from root
        join(process.cwd(), 'backend', 'uploads', filename),
      ];
      
      console.log(`[FilesController] Current working directory: ${process.cwd()}`);
      console.log(`[FilesController] __dirname: ${__dirname}`);
      console.log(`[FilesController] Searching for file: ${filename}`);
      
      let filePath: string | null = null;
      for (const path of possiblePaths) {
        console.log(`[FilesController] Checking path: ${path}`);
        if (existsSync(path)) {
          filePath = path;
          console.log(`[FilesController] ✅ File found at: ${filePath}`);
          break;
        } else {
          console.log(`[FilesController] ❌ File not found at: ${path}`);
        }
      }
      
      if (!filePath) {
        console.error(`[FilesController] ❌ File not found in any location. Tried:`, possiblePaths);
        console.error(`[FilesController] Current working directory: ${process.cwd()}`);
        console.error(`[FilesController] __dirname: ${__dirname}`);
        throw new NotFoundException(`File ${filename} not found. Files may have been lost due to container restart (Cloud Run containers are ephemeral).`);
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

