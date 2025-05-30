export interface IVatService {
    validate(countryCode: string, vat: string): Promise<{ validated: boolean; details: any, serviceError: boolean }>;
}