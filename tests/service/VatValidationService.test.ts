import { VatValidationService } from "../../source/service/VatValidationService";
import { IVatService } from "../../source/service/IVatService";

describe("VatValidationService", () => {
    const euService: IVatService = {
        validate: jest.fn().mockResolvedValue({ validated: true, details: "EU OK", serviceError: false }),
    };
    const chService: IVatService = {
        validate: jest.fn().mockResolvedValue({ validated: true, details: "CH OK", serviceError: false }),
    };

    const service = new VatValidationService(euService, chService);

    it("uses chService for CH country code", async () => {
        const result = await service.validate("CH", "CHE123456789");
        expect(chService.validate).toHaveBeenCalledWith("CH", "CHE123456789");
        expect(result).toEqual({ validated: true, details: "CH OK", serviceError: false });
    });

    it("uses euService for non-CH country code", async () => {
        const result = await service.validate("DE", "DE123456789");
        expect(euService.validate).toHaveBeenCalledWith("DE", "DE123456789");
        expect(result).toEqual({ validated: true, details: "EU OK", serviceError: false });
    });
});