import { EuVatService } from "../../source/service/EuVatService";
import { ChVatService } from "../../source/service/ChVatService";
import https from "https";

// Mock für https.request
jest.mock("https");

describe("EuVatService", () => {
    let reqCallback: any;
    const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
    };

    beforeEach(() => {
        (https.request as jest.Mock).mockImplementation((options, callback) => {
            reqCallback = callback;
            return mockRequest;
        });
        mockRequest.on.mockReset();
        mockRequest.write.mockReset();
        mockRequest.end.mockReset();
    });

    it("should validate a valid EU VAT number", async () => {
        const service = new EuVatService();
        const promise = service.validate("DE", "DE123456789");

        const res = {
            statusCode: 200,
            on: (event: string, cb: (chunk: any) => void) => {
                if (event === "data") cb(JSON.stringify({
                    valid: true,
                    requestDate: "2024-06-01",
                    countryCode: "DE",
                    vatNumber: "123456789",
                    traderName: "Test GmbH",
                    traderAddress: "Teststraße 1",
                }));
                if (event === "end") cb(null);
            }
        } as any;
        reqCallback(res);

        const result = await promise;
        expect(result.validated).toBe(true);
    });

    it("should handle invalid EU VAT number", async () => {
        const service = new EuVatService();
        const promise = service.validate("DE", "000000000");

        const res = {
            on: (event: string, cb: (chunk: any) => void) => {
                if (event === "data") cb(JSON.stringify({ isValid: false }));
                if (event === "end") cb(null);
            }
        } as any;
        reqCallback(res);

        const result = await promise;
        expect(result.validated).toBe(false);
    });

    it("should handle response parse error", async () => {
        const service = new EuVatService();
        const promise = service.validate("DE", "error");

        const res = {
            on: (event: string, cb: (chunk: any) => void) => {
                if (event === "data") cb("INVALID_JSON");
                if (event === "end") cb(null);
            }
        } as any;
        reqCallback(res);

        const result = await promise;
        expect(result.validated).toBe(false);
    });

    it("should handle request error", async () => {
        (https.request as jest.Mock).mockImplementationOnce((options, callback) => {
            setTimeout(() => {
                mockRequest.on.mock.calls
                    .filter(([event]) => event === "error")
                    .forEach(([, cb]) => cb(new Error("Test error")));
            }, 0);
            return mockRequest;
        });

        const service = new EuVatService();
        const result = await service.validate("DE", "error");
        expect(result.validated).toBe(false);
    });
});

describe("ChVatService", () => {
    let reqCallback: any;
    const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
    };

    beforeEach(() => {
        (https.request as jest.Mock).mockImplementation((options, callback) => {
            reqCallback = callback;
            return mockRequest;
        });
        mockRequest.on.mockReset();
        mockRequest.write.mockReset();
        mockRequest.end.mockReset();
    });

    it("should validate a valid CH VAT number", async () => {
        const service = new ChVatService();
        const promise = service.validate("CH", "CHE123456789");

        const res = {
            statusCode: 200,
            on: (event: string, cb: (chunk: any) => void) => {
                if (event === "data") cb(`<ValidateVatNumberResult>true</ValidateVatNumberResult>`);
                if (event === "end") cb(null);
            }
        } as any;
        reqCallback(res);

        const result = await promise;
        expect(result.validated).toBe(true);
    });

    it("should handle HTTP error", async () => {
        const service = new ChVatService();
        const promise = service.validate("CH", "CHE000000000");

        const res = {
            statusCode: 500,
            on: (event: string, cb: (chunk: any) => void) => {
                if (event === "data") cb("");
                if (event === "end") cb(null);
            }
        } as any;
        reqCallback(res);

        const result = await promise;
        expect(result.validated).toBe(false);
    });

    it("should handle SOAP fault", async () => {
        const service = new ChVatService();
        const promise = service.validate("CH", "CHEFAULT");

        const res = {
            statusCode: 200,
            on: (event: string, cb: (chunk: any) => void) => {
                if (event === "data") cb("<soap:Fault><faultstring>Test Fault</faultstring></soap:Fault>");
                if (event === "end") cb(null);
            }
        } as any;
        reqCallback(res);

        const result = await promise;
        expect(result.validated).toBe(false);
    });
});