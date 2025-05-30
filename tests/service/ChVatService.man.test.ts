// manual test, should not run in the CI pipeline

import { ChVatService } from "../../source/service/ChVatService";

describe("ChVatService (Manuell/Integration)", () => {
    const service = new ChVatService();

    it("validiert eine echte Schweizer USt-IdNr", async () => {
        const result = await service.validate("CH", "CHE-340.352.613");
        expect(result.validated).toBe(true);
    });

    it("lehnt eine ungültige Schweizer USt-IdNr ab", async () => {
        const result = await service.validate("CH", "CHE-000.000.000");
        expect(result.validated).toBe(false);
    });
});