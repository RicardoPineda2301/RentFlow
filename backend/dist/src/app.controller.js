"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    getDashboardSummary() {
        return this.appService.getDashboardSummary();
    }
    getOccupancyDistribution() {
        return this.appService.getOccupancyDistribution();
    }
    getPaymentStatusDistribution() {
        return this.appService.getPaymentStatusDistribution();
    }
    getRevenueChart() {
        return this.appService.getRevenueChart();
    }
    getContractsList(expiring, days) {
        return this.appService.getContractsList({
            expiring: expiring === 'true',
            days: days ? Number(days) : undefined,
        });
    }
    getApartments(search, status, projectId) {
        return this.appService.getApartments({ search, status, projectId });
    }
    getProjects() {
        return this.appService.getProjects();
    }
    createApartment(payload) {
        return this.appService.createApartment(payload);
    }
    updateApartment(id, payload) {
        return this.appService.updateApartment(id, payload);
    }
    deleteApartment(id) {
        return this.appService.deleteApartment(id);
    }
    uploadApartmentImages(id, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one image file is required.');
        }
        return this.appService.uploadApartmentImages(id, files);
    }
    async redirectContractPdf(id, res) {
        const { url } = await this.appService.getContractPdfRedirect(id);
        return res.redirect(url);
    }
    async redirectApartmentImage(id, res, key) {
        if (!key) {
            throw new common_1.BadRequestException('An image key is required.');
        }
        const { url } = await this.appService.getApartmentImageRedirect(id, key);
        return res.redirect(url);
    }
    getTenants(search) {
        return this.appService.getTenants({ search });
    }
    createTenant(payload) {
        return this.appService.createTenant(payload);
    }
    updateTenant(id, payload) {
        return this.appService.updateTenant(id, payload);
    }
    deleteTenant(id) {
        return this.appService.deleteTenant(id);
    }
    uploadContract(file, contractId) {
        if (!file) {
            throw new common_1.BadRequestException('A file is required for upload.');
        }
        return this.appService.uploadContractFile({ file, contractId });
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/occupancy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getOccupancyDistribution", null);
__decorate([
    (0, common_1.Get)('dashboard/payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getPaymentStatusDistribution", null);
__decorate([
    (0, common_1.Get)('dashboard/revenue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('contracts'),
    __param(0, (0, common_1.Query)('expiring')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getContractsList", null);
__decorate([
    (0, common_1.Get)('apartments'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getApartments", null);
__decorate([
    (0, common_1.Get)('projects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Post)('apartments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createApartment", null);
__decorate([
    (0, common_1.Patch)('apartments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateApartment", null);
__decorate([
    (0, common_1.Delete)('apartments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteApartment", null);
__decorate([
    (0, common_1.Post)('apartments/:id/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "uploadApartmentImages", null);
__decorate([
    (0, common_1.Get)('contracts/:id/pdf/redirect'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "redirectContractPdf", null);
__decorate([
    (0, common_1.Get)('apartments/:id/images/redirect'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "redirectApartmentImage", null);
__decorate([
    (0, common_1.Get)('tenants'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getTenants", null);
__decorate([
    (0, common_1.Post)('tenants'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Patch)('tenants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)('tenants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Post)('contracts/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('contractId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "uploadContract", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map