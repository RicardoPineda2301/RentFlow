import { PrismaService } from '../prisma/prisma.service';
type ExpiringContract = {
    id: string;
    endDate: Date;
    apartmentUnitNumber: string;
};
type DashboardSummary = {
    totalApartments: number;
    occupiedApartments: number;
    occupancyRate: number;
    pendingCollections: number;
    pendingPaymentsCount: number;
    expiringContractsCount: number;
    expiringContracts: ExpiringContract[];
};
type OccupancyData = {
    name: string;
    value: number;
    color: string;
};
type PaymentStatusData = {
    status: string;
    count: number;
    color: string;
};
type ContractListing = {
    id: string;
    apartmentUnitNumber: string;
    tenantName: string;
    startDate: Date;
    endDate: Date;
    monthlyRentRate: number;
    status: string;
};
type ChartDataPoint = {
    month: string;
    revenue: number;
    paid: number;
    pending: number;
};
type ApartmentPayload = {
    projectId: string;
    unitNumber: string;
    sizeM2: number;
    bedrooms: number;
    bathrooms: number;
    monthlyRent: number;
    status: string;
};
type TenantPayload = {
    firstNames: string;
    lastNames: string;
    email: string;
    phone: string;
};
type ApartmentQuery = {
    search?: string;
    status?: string;
    projectId?: string;
};
type TenantQuery = {
    search?: string;
};
type UploadContractInput = {
    file: {
        originalname: string;
        mimetype: string;
        buffer: Buffer;
    };
    contractId?: string;
};
export declare class AppService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getS3Client;
    getHello(): string;
    getDashboardSummary(): Promise<DashboardSummary>;
    getOccupancyDistribution(): Promise<OccupancyData[]>;
    getPaymentStatusDistribution(): Promise<PaymentStatusData[]>;
    getRevenueChart(): Promise<ChartDataPoint[]>;
    getContractsList(): Promise<ContractListing[]>;
    getApartments(query: ApartmentQuery): Promise<({
        project: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        unitNumber: string;
        sizeM2: number;
        bedrooms: number;
        bathrooms: number;
        monthlyRent: number;
        status: string;
    })[]>;
    getProjects(): Promise<{
        name: string;
        id: string;
    }[]>;
    createApartment(payload: ApartmentPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        unitNumber: string;
        sizeM2: number;
        bedrooms: number;
        bathrooms: number;
        monthlyRent: number;
        status: string;
    }>;
    updateApartment(id: string, payload: Partial<ApartmentPayload>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        unitNumber: string;
        sizeM2: number;
        bedrooms: number;
        bathrooms: number;
        monthlyRent: number;
        status: string;
    }>;
    deleteApartment(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        unitNumber: string;
        sizeM2: number;
        bedrooms: number;
        bathrooms: number;
        monthlyRent: number;
        status: string;
    }>;
    getTenants(query: TenantQuery): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstNames: string;
        lastNames: string;
        email: string;
        phone: string;
    }[]>;
    createTenant(payload: TenantPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstNames: string;
        lastNames: string;
        email: string;
        phone: string;
    }>;
    updateTenant(id: string, payload: Partial<TenantPayload>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstNames: string;
        lastNames: string;
        email: string;
        phone: string;
    }>;
    deleteTenant(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstNames: string;
        lastNames: string;
        email: string;
        phone: string;
    }>;
    uploadContractFile({ file, contractId }: UploadContractInput): Promise<{
        key: string;
        bucket: string;
        url: string;
    }>;
}
export {};
