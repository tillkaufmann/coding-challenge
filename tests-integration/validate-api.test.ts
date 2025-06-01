import request from "supertest";
import createApp from "../source/server";
import { readAppConfiguration } from "../source/models/ConfigurationModel";

const configuration = readAppConfiguration("app.conf.json");
const app = createApp(configuration).app;

describe("POST /validate/vat", () => {
    it("should fail for invalid VAT (DE)", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "DE", vat: "INVALIDVAT" });
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            validated: false,
            details: expect.any(String),
        });
    });

    it("should fail for invalid Country Code", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "US", vat: "123456798" });
        expect(res.status).toBe(501);
        expect(res.body).toMatchObject({
            validated: false,
            details: expect.any(String),
        });
    });

    it("should succeed for valid DE VAT", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "DE", vat: "DE279448078" }); // Beispiel aus bestehenden Tests
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            validated: true,
            details: expect.any(String),
        });
    });

    it("should succeed for valid CH VAT", async () => {
        const res = await request(app)
            .post("/validate/vat")
            .send({ countryCode: "CH", vat: "CHE-340.352.613" }); // Beispiel aus bestehenden Tests
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            validated: true,
            details: expect.any(String),
        });
    });
});