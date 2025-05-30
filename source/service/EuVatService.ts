import https from "https";

export class EuVatService {
    async validate(countryCode: string, vat: string) {
        // remove country code prefix if present
        if (vat.toUpperCase().startsWith(countryCode.toUpperCase())) {
            vat = vat.slice(countryCode.length);
        }
        console.log(`[EU VAT] Starting validation for ${countryCode}-${vat}`);

        const data = JSON.stringify({
            countryCode,
            vatNumber: vat,
        });

        const options = {
            hostname: "ec.europa.eu",
            path: "/taxation_customs/vies/rest-api/check-vat-number",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Content-Length": Buffer.byteLength(data),
            },
            timeout: 10000,
        };

        return new Promise<{ validated: boolean; details: any, serviceError: boolean }>((resolve) => {
            const req = https.request(options, (res) => {
                let body = "";
                res.on("data", (chunk) => { body += chunk; });
                res.on("end", () => {
                    if (res.statusCode !== 200) {
                        console.error(`[EU VAT] HTTP error: ${res.statusCode}`);
                        return resolve({
                            validated: false,
                            details: `HTTP error: ${res.statusCode}`,
                            serviceError: true,
                        });
                    }
                    try {
                        const response = JSON.parse(body);
                        console.log("[EU VAT] Response received:", response);
                        const { valid } = response;
                        resolve({
                            validated: valid === true,
                            details: "OK",
                            serviceError: false,
                        });
                    } catch (e) {
                        console.error("[EU VAT] Response parse error:", e);
                        resolve({
                            validated: false,
                            details: "EU VAT Service response parse error",
                            serviceError: false,
                        });
                    }
                });
            });

            req.on("error", (e) => {
                console.error("[EU VAT] Request error:", e.message);
                resolve({
                    validated: false,
                    details: "EU VAT Service error: " + e.message,
                    serviceError: true
                });
            });

            req.write(data);
            req.end();
        });
    }
}