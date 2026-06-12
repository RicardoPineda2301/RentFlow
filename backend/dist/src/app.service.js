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
    async getContractsList() {
        const contracts = await this.prisma.contract.findMany({
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
        return this.prisma.apartment.findMany({
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
            },
            orderBy: { createdAt: 'desc' },
        });
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
        const endpoint = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || 'http://localhost:9000';
        return {
            key,
            bucket,
            url: `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`,
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map