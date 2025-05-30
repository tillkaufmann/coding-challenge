import request from "supertest";
import createApp from "../source/server";
import { readAppConfiguration } from "../source/models/ConfigurationModel";

const configuration = readAppConfiguration("app.conf.json");
const app = createApp(configuration).app;

describe("POST /api/validate", () => {
    it("should fail for invalid VAT (DE)", async () => {
        const res = await request(app)
            .post("/api/validate")
            .send({ countryCode: "DE", vat: "INVALIDVAT" });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message");
    });

    it("should succeed for valid DE VAT", async () => {
        const res = await request(app)
            .post("/api/validate")
            .send({ countryCode: "DE", vat: "DE123456789" }); // Beispiel aus bestehenden Tests
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            validated: true,
            details: expect.any(String),
        });
    });

    it("should succeed for valid CH VAT", async () => {
        const res = await request(app)
            .post("/api/validate")
            .send({ countryCode: "CH", vat: "CHE-123.456.789" }); // Beispiel aus bestehenden Tests
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            validated: true,
            details: expect.any(String),
        });
    });
});