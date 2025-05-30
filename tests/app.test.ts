import request from "supertest";
import express from "express";
import ValidateRouter from "../source/routers/ValidateRouter";
import { Configuration } from "../source/models/ConfigurationModel";

const configuration: Configuration = {
    port: 12345,
    expressServerOptions: {
        keepAliveTimeout: 5000,
        maxHeadersCount: 1000,
        maxConnections: 100,
        headersTimeout: 60000,
        requestTimeout: 30000,
        timeout: 30000,
    },
    validation: {
        regexes: [
            { countryCode: "DE", regex: "^DE[0-9]{9}$" },
            { countryCode: "FR", regex: "^FR[0-9A-Z]{2}[0-9]{9}$" },
        ],
    },
};

const mockVatService = {
    validate: jest.fn(async (countryCode: string, vat: string) => {
        if (countryCode === "DE" && vat === "DE123456789") {
            return { validated: true, details: { info: "ok" } };
        }
        return { validated: false, details: { info: "fail" } };
    }),
};

const app = express();
app.use(express.json());
app.use(ValidateRouter(configuration, mockVatService as any));

describe("POST /validate/vat", () => {
    it("should accept a valid German VAT number", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "DE", vat: "DE123456789" });
        expect(res.body.validated).toBe(true);
        expect(res.body.details).toBeDefined();
    });

    it("should reject an invalid German VAT number", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "DE", vat: "INVALID" });
        expect(res.body.validated).not.toBe(true);
        expect(res.body.details).toBeDefined();
    });

    it("should reject an unknown country code", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "XX", vat: "XX123456789" });
        expect(res.body.validated).not.toBe(true);
        expect(res.body.details).toBeDefined();
    });
});