import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard/summary')
  getDashboardSummary() {
    return this.appService.getDashboardSummary();
  }

  @Get('dashboard/occupancy')
  getOccupancyDistribution() {
    return this.appService.getOccupancyDistribution();
  }

  @Get('dashboard/payments')
  getPaymentStatusDistribution() {
    return this.appService.getPaymentStatusDistribution();
  }

  @Get('dashboard/revenue')
  getRevenueChart() {
    return this.appService.getRevenueChart();
  }

  @Get('contracts')
  getContractsList(
    @Query('expiring') expiring?: string,
    @Query('days') days?: string,
  ) {
    return this.appService.getContractsList({
      expiring: expiring === 'true',
      days: days ? Number(days) : undefined,
    });
  }

  @Get('apartments')
  getApartments(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.appService.getApartments({ search, status, projectId });
  }

  @Get('projects')
  getProjects() {
    return this.appService.getProjects();
  }

  @Post('apartments')
  createApartment(@Body() payload: any) {
    return this.appService.createApartment(payload);
  }

  @Patch('apartments/:id')
  updateApartment(@Param('id') id: string, @Body() payload: any) {
    return this.appService.updateApartment(id, payload);
  }

  @Delete('apartments/:id')
  deleteApartment(@Param('id') id: string) {
    return this.appService.deleteApartment(id);
  }

  @Post('apartments/:id/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadApartmentImages(
    @Param('id') id: string,
    @UploadedFiles() files: any[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required.');
    }

    return this.appService.uploadApartmentImages(id, files);
  }

  @Get('contracts/:id/pdf/redirect')
  async redirectContractPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { url } = await this.appService.getContractPdfRedirect(id);
    return res.redirect(url);
  }

  @Get('apartments/:id/images/redirect')
  async redirectApartmentImage(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('key') key?: string,
  ) {
    if (!key) {
      throw new BadRequestException('An image key is required.');
    }

    const { url } = await this.appService.getApartmentImageRedirect(id, key);
    return res.redirect(url);
  }

  @Get('tenants')
  getTenants(@Query('search') search?: string) {
    return this.appService.getTenants({ search });
  }

  @Post('tenants')
  createTenant(@Body() payload: any) {
    return this.appService.createTenant(payload);
  }

  @Patch('tenants/:id')
  updateTenant(@Param('id') id: string, @Body() payload: any) {
    return this.appService.updateTenant(id, payload);
  }

  @Delete('tenants/:id')
  deleteTenant(@Param('id') id: string) {
    return this.appService.deleteTenant(id);
  }

  @Post('contracts/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadContract(
    @UploadedFile() file: any,
    @Body('contractId') contractId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required for upload.');
    }

    return this.appService.uploadContractFile({ file, contractId });
  }
}
