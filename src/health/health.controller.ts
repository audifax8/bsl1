import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
//import { version, name } from '../../package.json';
import * as os from 'os';

@Controller('_health')
export class HealthController {
  @Get()
  get(@Res() response: Response): Response {
    const hostname = os.hostname();
    const startTime = new Date(Date.now() - process.uptime()).toISOString();
    return response.status(HttpStatus.OK).send({
      available: true,
      //app: name,
      uptime: process.uptime(),
      serverId: `${hostname} ${process.pid}`,
      hostname,
      startTime,
      //version,
    });
  }
}
