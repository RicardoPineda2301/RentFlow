import type { Response } from 'express';
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
    getContractsList(expiring?: string, days?: string): Promise<{
        id: string;
        apartmentProjectName: string;
        apartmentUnitNumber: string;
        tenantName: string;
        startDate: Date;
        endDate: Date;
        monthlyRentRate: number;
        status: string;
    }[]>;
    getApartments(search?: string, status?: string, projectId?: string): Promise<{
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
        imageKeys: string[];
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
    uploadApartmentImages(id: string, files: any[]): Promise<{
        apartmentId: string;
        bucket: string;
        uploadedImages: {
            key: string;
            url: string;
            filename: string;
        }[];
    }>;
    redirectContractPdf(id: string, res: Response): Promise<void>;
    redirectApartmentImage(id: string, res: Response, key?: string): Promise<void>;
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
