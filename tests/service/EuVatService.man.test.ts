// manual test, should not run in the CI pipeline

import { EuVatService } from "../../source/service/EuVatService";

describe("EuVatService (Integration)", () => {
    const service = new EuVatService();

    it("should validate a real valid German VAT number", async () => {
        const result = await service.validate("DE", "279448078");
        expect(result.validated).toBe(true);
        expect(result.details.countryCode).toBe("DE");
    });

    it("should validate a real valid German VAT number", async () => {
        const result = await service.validate("DE", "DE279448078");
        expect(result.validated).toBe(true);
        expect(result.details.countryCode).toBe("DE");
    });

    it("should reject an invalid German VAT number", async () => {
        const result = await service.validate("DE", "000000000");
        expect(result.validated).toBe(false);
    });
});