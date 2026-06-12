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
    apartmentProjectName: string;
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
type ContractQuery = {
    expiring?: boolean;
    days?: number;
};
type UploadContractInput = {
    file: {
        originalname: string;
        mimetype: string;
        buffer: Buffer;
    };
    contractId?: string;
};
type UploadApartmentImageInput = {
    files: Array<{
        originalname: string;
        mimetype: string;
        buffer: Buffer;
    }>;
};
export declare class AppService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getS3Client;
    private getS3PublicBaseUrl;
    private createSignedImageUrl;
    getHello(): string;
    getDashboardSummary(): Promise<DashboardSummary>;
    getOccupancyDistribution(): Promise<OccupancyData[]>;
    getPaymentStatusDistribution(): Promise<PaymentStatusData[]>;
    getRevenueChart(): Promise<ChartDataPoint[]>;
    getContractsList(query?: ContractQuery): Promise<ContractListing[]>;
    getApartments(query: ApartmentQuery): Promise<{
        activeContractId: string;
        activeContractPdfKey: string | null;
        project: {
            name: string;
        };
        contracts: {
            id: string;
            s3PdfKey: string | null;
        }[];
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
        imageKeys: string[];
    }[]>;
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
        imageKeys: string[];
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
        imageKeys: string[];
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
        imageKeys: string[];
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
    uploadApartmentImages(apartmentId: string, files: UploadApartmentImageInput['files']): Promise<{
        apartmentId: string;
        bucket: string;
        uploadedImages: {
            key: string;
            url: string;
            filename: string;
        }[];
    }>;
    getContractPdfRedirect(contractId: string): Promise<{
        url: string;
    }>;
    getApartmentImageRedirect(apartmentId: string, key: string): Promise<{
        url: string;
    }>;
}
export {};
