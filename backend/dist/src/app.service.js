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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const prisma_service_1 = require("../prisma/prisma.service");
let AppService = class AppService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getS3Client() {
        const region = process.env.S3_REGION || 'us-east-1';
        const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
        const accessKeyId = process.env.S3_ACCESS_KEY || 'minio_admin';
        const secretAccessKey = process.env.S3_SECRET_KEY || 'minio_password123';
        const usePathStyle = (process.env.S3_FORCE_PATH_STYLE || 'true') === 'true';
        return new client_s3_1.S3Client({
            region,
            endpoint,
            forcePathStyle: usePathStyle,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    getS3PublicBaseUrl() {
        return process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || 'http://localhost:9000';
    }
    async createSignedImageUrl(bucket, key) {
        const s3 = this.getS3Client();
        return (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }), { expiresIn: 60 * 15 });
    }
    getHello() {
        return 'Hello World!';
    }
    async getDashboardSummary() {
        const now = new Date();
        const in30Days = (0, date_fns_1.addDays)(now, 30);
        const [totalApartments, occupiedApartments, pendingPayments, expiringContractsRaw,] = await Promise.all([
            this.prisma.apartment.count(),
            this.prisma.apartment.count({ where: { status: 'OCCUPIED' } }),
            this.prisma.payment.findMany({
                where: {
                    status: { in: ['PENDING', 'OVERDUE'] },
                },
                select: {
                    amount: true,
                },
            }),
            this.prisma.contract.findMany({
                where: {
                    status: 'ACTIVE',
                    endDate: {
                        gte: now,
                        lte: in30Days,
                    },
                },
                orderBy: { endDate: 'asc' },
                take: 5,
                select: {
                    id: true,
                    endDate: true,
                    apartment: {
                        select: {
                            unitNumber: true,
                        },
                    },
                },
            }),
        ]);
        const pendingCollections = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
        const occupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;
        return {
            totalApartments,
            occupiedApartments,
            occupancyRate,
            pendingCollections,
            pendingPaymentsCount: pendingPayments.length,
            expiringContractsCount: expiringContractsRaw.length,
            expiringContracts: expiringContractsRaw.map((contract) => ({
                id: contract.id,
                endDate: contract.endDate,
                apartmentUnitNumber: contract.apartment.unitNumber,
            })),
        };
    }
    async getOccupancyDistribution() {
        const [available, occupied, maintenance] = await Promise.all([
            this.prisma.apartment.count({ where: { status: 'AVAILABLE' } }),
            this.prisma.apartment.count({ where: { status: 'OCCUPIED' } }),
            this.prisma.apartment.count({ where: { status: 'MAINTENANCE' } }),
        ]);
        return [
            { name: 'Occupied', value: occupied, color: '#3b82f6' },
            { name: 'Available', value: available, color: '#10b981' },
            { name: 'Maintenance', value: maintenance, color: '#ef4444' },
        ];
    }
    async getPaymentStatusDistribution() {
        const [paid, pending, overdue] = await Promise.all([
            this.prisma.payment.count({ where: { status: 'PAID' } }),
            this.prisma.payment.count({ where: { status: 'PENDING' } }),
            this.prisma.payment.count({ where: { status: 'OVERDUE' } }),
        ]);
        return [
            { status: 'Paid', count: paid, color: '#10b981' },
            { status: 'Pending', count: pending, color: '#f59e0b' },
            { status: 'Overdue', count: overdue, color: '#ef4444' },
        ];
    }
    async getRevenueChart() {
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            last6Months.push((0, date_fns_1.subMonths)(new Date(), i));
        }
        const chartData = [];
        for (const monthStart of last6Months) {
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            const payments = await this.prisma.payment.findMany({
                where: {
                    dueDate: {
                        gte: monthStart,
                        lt: monthEnd,
                    },
                },
                select: {
                    status: true,
                    amount: true,
                },
            });
            const paid = payments
                .filter((p) => p.status === 'PAID')
                .reduce((sum, p) => sum + p.amount, 0);
            const pending = payments
                .filter((p) => p.status === 'PENDING')
                .reduce((sum, p) => sum + p.amount, 0);
            const totalRevenue = paid + pending;
            chartData.push({
                month: (0, date_fns_1.format)(monthStart, 'MMM'),
                revenue: totalRevenue,
                paid,
                pending,
            });
        }
        return chartData;
    }
    async getContractsList(query = {}) {
        const { expiring, days = 30 } = query;
        const where = {};
        if (expiring) {
            const now = new Date();
            const limit = new Date(now);
            limit.setDate(limit.getDate() + days);
            where.status = 'ACTIVE';
            where.endDate = {
                gte: now,
                lte: limit,
            };
        }
        const contracts = await this.prisma.contract.findMany({
            where,
            orderBy: { endDate: 'asc' },
            select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
                monthlyRentRate: true,
                apartment: {
                    select: {
                        unitNumber: true,
                        project: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        firstNames: true,
                        lastNames: true,
                    },
                },
            },
        });
        return contracts.map((contract) => ({
            id: contract.id,
            apartmentProjectName: contract.apartment.project.name,
            apartmentUnitNumber: contract.apartment.unitNumber,
            tenantName: `${contract.tenant.firstNames} ${contract.tenant.lastNames}`,
            startDate: contract.startDate,
            endDate: contract.endDate,
            monthlyRentRate: contract.monthlyRentRate,
            status: contract.status,
        }));
    }
    async getApartments(query) {
        const { search, status, projectId } = query;
        const apartments = await this.prisma.apartment.findMany({
            where: {
                ...(status ? { status } : {}),
                ...(projectId ? { projectId } : {}),
                ...(search
                    ? {
                        OR: [
                            { unitNumber: { contains: search, mode: 'insensitive' } },
                            { project: { name: { contains: search, mode: 'insensitive' } } },
                        ],
                    }
                    : {}),
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
                contracts: {
                    where: { status: 'ACTIVE' },
                    orderBy: { startDate: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        s3PdfKey: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return apartments.map((apt) => ({
            ...apt,
            activeContractId: apt.contracts[0]?.id ?? null,
            activeContractPdfKey: apt.contracts[0]?.s3PdfKey ?? null,
        }));
    }
    async getProjects() {
        return this.prisma.project.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
            },
        });
    }
    async createApartment(payload) {
        return this.prisma.apartment.create({ data: payload });
    }
    async updateApartment(id, payload) {
        return this.prisma.apartment.update({
            where: { id },
            data: payload,
        });
    }
    async deleteApartment(id) {
        return this.prisma.apartment.delete({ where: { id } });
    }
    async getTenants(query) {
        const { search } = query;
        return this.prisma.tenant.findMany({
            where: search
                ? {
                    OR: [
                        { firstNames: { contains: search, mode: 'insensitive' } },
                        { lastNames: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }
    async createTenant(payload) {
        return this.prisma.tenant.create({ data: payload });
    }
    async updateTenant(id, payload) {
        return this.prisma.tenant.update({
            where: { id },
            data: payload,
        });
    }
    async deleteTenant(id) {
        return this.prisma.tenant.delete({ where: { id } });
    }
    async uploadContractFile({ file, contractId }) {
        const bucket = process.env.S3_BUCKET || 'rentflowtest01';
        const now = new Date();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const key = `contracts/${contractId || 'unassigned'}/${now.getTime()}-${safeName}`;
        const s3 = this.getS3Client();
        await s3.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        if (contractId) {
            await this.prisma.contract.update({
                where: { id: contractId },
                data: { s3PdfKey: key },
            });
        }
        return {
            key,
            bucket,
            url: `${this.getS3PublicBaseUrl().replace(/\/$/, '')}/${bucket}/${key}`,
        };
    }
    async uploadApartmentImages(apartmentId, files) {
        const bucket = process.env.S3_APARTMENT_IMAGES_BUCKET || 'rentflowtest02images';
        const apartment = await this.prisma.apartment.findUnique({
            where: { id: apartmentId },
            select: { imageKeys: true },
        });
        if (!apartment) {
            throw new common_1.NotFoundException(`Apartment ${apartmentId} not found.`);
        }
        const s3 = this.getS3Client();
        const uploadedImages = [];
        for (const [index, file] of files.entries()) {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const key = `apartments/${apartmentId}/${Date.now()}-${index}-${safeName}`;
            await s3.send(new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
            uploadedImages.push({
                key,
                filename: file.originalname,
                url: `${this.getS3PublicBaseUrl().replace(/\/$/, '')}/${bucket}/${key}`,
            });
        }
        await this.prisma.apartment.update({
            where: { id: apartmentId },
            data: {
                imageKeys: [...apartment.imageKeys, ...uploadedImages.map((image) => image.key)],
            },
        });
        return {
            apartmentId,
            bucket,
            uploadedImages,
        };
    }
    async getContractPdfRedirect(contractId) {
        const bucket = process.env.S3_BUCKET || 'rentflowtest01';
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            select: { s3PdfKey: true },
        });
        if (!contract?.s3PdfKey) {
            throw new common_1.NotFoundException('No PDF found for this contract.');
        }
        return {
            url: await this.createSignedImageUrl(bucket, contract.s3PdfKey),
        };
    }
    async getApartmentImageRedirect(apartmentId, key) {
        const bucket = process.env.S3_APARTMENT_IMAGES_BUCKET || 'rentflowtest02images';
        const apartment = await this.prisma.apartment.findUnique({
            where: { id: apartmentId },
            select: { imageKeys: true },
        });
        if (!apartment || !apartment.imageKeys.includes(key)) {
            throw new common_1.NotFoundException('Apartment image not found.');
        }
        return {
            url: await this.createSignedImageUrl(bucket, key),
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map