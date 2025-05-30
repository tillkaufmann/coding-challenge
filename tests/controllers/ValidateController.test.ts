import ValidateController from "../../source/controllers/ValidateController";
import { Configuration } from "../../source/models/ConfigurationModel";

const configuration: Configuration = {
    port: 12345,
    expressServerOptions: {
        keepAliveTimeout: 5000,
        maxHeadersCount: 100,
        maxConnections: 1000,
        headersTimeout: 60000,
        requestTimeout: 30000,
        timeout: 120000,
    },
    validation: {
        regexes: [
            { countryCode: "DE", regex: "^DE[0-9]{9}$" },
            { countryCode: "FR", regex: "^FR[0-9A-Z]{2}[0-9]{9}$" },
        ],
    },
};

// Nur die Methode mocken, nicht die Properties
const mockVatService = {
    validate: jest.fn(async (countryCode: string, vat: string) => {
        if (countryCode === "DE" && /^DE[0-9]{9}$/.test(vat)) {
            return { validated: true, details: undefined };
        }
        if (countryCode === "FR" && /^FR[0-9A-Z]{2}[0-9]{9}$/.test(vat)) {
            return { validated: true, details: undefined };
        }
        return { validated: false, details: undefined };
    }),
};

describe("ValidateController.validateVatRequest", () => {
    const controller = new ValidateController(configuration, mockVatService as any);

    it("should accept a valid German VAT number", async () => {
        const result = await controller.validateVatRequest("DE", "DE123456789");
        expect(result.valid).toBe(true);
    });

    it("should reject an invalid German VAT number", async () => {
        const result = await controller.validateVatRequest("DE", "INVALID");
        expect(result.valid).toBe(false);
    });

    it("should reject an unknown country code", async () => {
        const result = await controller.validateVatRequest("XX", "XX123456789");
        expect(result.valid).toBe(false);
    });

    it("should accept a valid French VAT number", async () => {
        const result = await controller.validateVatRequest("FR", "FRAB123456789");
        expect(result.valid).toBe(true);
    });
});