import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    // Extract more details for Prisma errors
    let errorDetails: any = {};
    if (exception instanceof Error) {
      // Check if it's a Prisma error
      if (exception.message.includes('Prisma') || exception.message.includes('prisma')) {
        errorDetails.type = 'DatabaseError';
        // Include more context for Prisma errors
        if (exception.message.includes('P2002')) {
          errorDetails.details = 'Unique constraint violation';
        } else if (exception.message.includes('P2025')) {
          errorDetails.details = 'Record not found';
        } else if (exception.message.includes('P1001')) {
          errorDetails.details = 'Database connection error';
        } else if (exception.message.includes('P2003')) {
          errorDetails.details = 'Foreign key constraint violation';
        }
      }
    }

    // Log the full error for debugging
    this.logger.error(
      `Exception caught: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Return a user-friendly error response with more details
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || 'Internal server error',
      ...(Object.keys(errorDetails).length > 0 && { error: errorDetails }),
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error && {
        stack: exception.stack,
      }),
    });
  }
}

