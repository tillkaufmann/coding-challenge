import { Configuration } from "../models/ConfigurationModel.js";
import { VatValidationService } from "../service/VatValidationService.js";

export default class ValidateController {
    configuration: Configuration;
    vatService: VatValidationService;

    constructor(configuration: Configuration, vatService: VatValidationService) {
        this.configuration = configuration;
        this.vatService = vatService;
    }

    async validateVatRequest(
       countryCode: string, vat: string
    ): Promise<{ valid: boolean; returnCode: number,  message?: string }> {
        const regexEntry = this.configuration.validation.regexes.find(
            (entry) => entry.countryCode === countryCode
        );
        if (!regexEntry) {
            return { valid: false, returnCode: 501,  message: "Not Implemented" };
        }

        const regexValidator = new RegExp(regexEntry.regex);
        const valRes = regexValidator.exec(vat);
        if (!valRes || valRes.length < 1) {
            return { valid: false, returnCode: 400, message: `VAT is not valid` };
        }

        const result = await this.vatService.validate(countryCode, vat);
        if (result.serviceError){
            return {
                valid: false,
                returnCode: 503,
                message: `external vat service is not available`
            };
        }

        if (!result.validated){
            return {
                valid: result.validated,
                returnCode: 400,
                message: result.details
            };
        }

        return {
            valid: result.validated,
            returnCode: 200,
            message: result.details
        };
    }
}