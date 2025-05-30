import { IVatService } from "./IVatService.js";

export class VatValidationService {
    constructor(
        private euService: IVatService,
        private chService: IVatService
    ) {}

    async validate(countryCode: string, vat: string) {
        if (countryCode === "CH") {
            return this.chService.validate(countryCode, vat);
        } else {
            return this.euService.validate(countryCode, vat);
        }
    }
}