import { Controller, Post, Get, Param, Query, UploadedFile, UploadedFiles, UseInterceptors, HttpCode, BadRequestException, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor,} from '@nestjs/platform-express';
import { Express } from 'express';
import { ConfigService } from './config.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/constants/roles.enum';

@Controller('api/v1/config/')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // — CPS Zone Upload (three files) — all properties now required
  @Roles(Role.Admin)
  @Post('cps-zone/upload-set')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'trigger_points_file', maxCount: 1 },
      { name: 'exit_points_file',      maxCount: 1 },
      { name: 'growing_seasons_file',  maxCount: 1 },
    ]),
  )
  @HttpCode(201)
  uploadCpsZone(
    @UploadedFiles()
    files: {
      trigger_points_file: Express.Multer.File[];
      exit_points_file:      Express.Multer.File[];
      growing_seasons_file:  Express.Multer.File[];
    },
  ) {
    const trigger = files.trigger_points_file[0];
    const exit    = files.exit_points_file[0];
    const growing = files.growing_seasons_file[0];

    if (!trigger || !exit || !growing) {
      throw new BadRequestException(
        'Missing files: trigger_points_file, exit_points_file, and growing_seasons_file are all required'
      );
    }

    return this.configService.uploadCpsZone(trigger, exit, growing);
  }

  @Roles(Role.Admin)
  @Get('cps-zone/:cps_zone_value/:period_value')
  getCpsZonePeriodConfig(
    @Param('cps_zone_value', ParseIntPipe) cpsZone: number,
    @Param('period_value',   ParseIntPipe) period:  number,
  ) {
    return this.configService.getCpsZonePeriodConfig(cpsZone, period);
  }

  @Roles(Role.Admin)
  @Get('cps-zone/zone/:cps_zone_value')
  getAllPeriodsForCpsZone(
    @Param('cps_zone_value', ParseIntPipe) cpsZone: number,
  ) {
    return this.configService.getAllPeriodsForCpsZone(cpsZone);
  }

  @Roles(Role.Admin)
  @Get('cps-zone/files')
  getUploadedCpsFiles() {
    return this.configService.getUploadedCpsFiles();
  }

  @Roles(Role.Admin)
  @Get('cps-zone/files/:filename')
  getUploadedCpsFile(@Param('filename') filename: string) {
    return this.configService.getUploadedCpsFile(filename);
  }

  // — NDVI Upload & Status —
  @Roles(Role.Admin)
  @Post('ndvi/upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(202)
  uploadNdviFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('NDVI file is required');
    }
    return this.configService.uploadNdviFile(file);
  }

  @Roles(Role.Admin)
  @Get('ndvi/upload/status/:job_id')
  getNdviUploadStatus(@Param('job_id') jobId: string) {
    return this.configService.getNdviUploadStatus(jobId);
  }

  @Roles(Role.Admin)
  @Get('ndvi/:grid_id/:period_id')
  getNdvi(
    @Param('grid_id',   ParseIntPipe) gridId:   number,
    @Param('period_id', ParseIntPipe) periodId: number,
  ) {
    return this.configService.getNdvi(gridId, periodId);
  }

  @Roles(Role.Admin)
  @Get('ndvi/:grid_id')
  getNdviForGrid(@Param('grid_id', ParseIntPipe) gridId: number) {
    return this.configService.getNdviForGrid(gridId);
  }

  @Roles(Role.Admin)
  @Get('ndvi')
  getAllNdviData(
    @Query('skip',  new DefaultValuePipe(0),    ParseIntPipe) skip:  number,
    @Query('limit', new DefaultValuePipe(1000), ParseIntPipe) limit: number,
  ) {
    return this.configService.getAllNdviData(skip, limit);
  }

  @Roles(Role.Admin)
  @Get('ndvi/files')
  getUploadedNdviFiles() {
    return this.configService.getUploadedNdviFiles();
  }

  @Roles(Role.Admin)
  @Get('ndvi/files/:filename')
  getUploadedNdviFile(@Param('filename') filename: string) {
    return this.configService.getUploadedNdviFile(filename);
  }
}
