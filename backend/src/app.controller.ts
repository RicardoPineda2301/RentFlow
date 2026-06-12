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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  getContractsList() {
    return this.appService.getContractsList();
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
