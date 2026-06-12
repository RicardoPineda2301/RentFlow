import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getDashboardSummary(): Promise<{
        totalApartments: number;
        occupiedApartments: number;
        occupancyRate: number;
        pendingCollections: number;
        pendingPaymentsCount: number;
        expiringContractsCount: number;
        expiringContracts: {
            id: string;
            endDate: Date;
            apartmentUnitNumber: string;
        }[];
    }>;
    getOccupancyDistribution(): Promise<{
        name: string;
        value: number;
        color: string;
    }[]>;
    getPaymentStatusDistribution(): Promise<{
        status: string;
        count: number;
        color: string;
    }[]>;
    getRevenueChart(): Promise<{
        month: string;
        revenue: number;
        paid: number;
        pending: number;
    }[]>;
    getContractsList(): Promise<{
        id: string;
        apartmentUnitNumber: string;
        tenantName: string;
        startDate: Date;
        endDate: Date;
        monthlyRentRate: number;
        status: string;
    }[]>;
    getApartments(search?: string, status?: string, projectId?: string): Promise<({
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
    createApartment(payload: any): Promise<{
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
    updateApartment(id: string, payload: any): Promise<{
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
    getTenants(search?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstNames: string;
        lastNames: string;
        email: string;
        phone: string;
    }[]>;
    createTenant(payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstNames: string;
        lastNames: string;
        email: string;
        phone: string;
    }>;
    updateTenant(id: string, payload: any): Promise<{
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
    uploadContract(file: any, contractId?: string): Promise<{
        key: string;
        bucket: string;
        url: string;
    }>;
}
