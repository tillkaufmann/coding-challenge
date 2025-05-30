import https from "https";

export class ChVatService {
    async validate(countryCode: string, vat: string): Promise<{ validated: boolean; details: any, serviceError: boolean }> {
        // Format VAT: remove spaces, dots, dashes, uppercase, ensure CHE prefix
        let vatNumber = vat.replace(/[\s]/g, "").toUpperCase();
        if (!vatNumber.startsWith("CHE")) vatNumber = "CHE" + vatNumber.replace(/^CH/, "");

        console.log(`[CH VAT] Starting VAT validation for ${countryCode}-${vatNumber}`);

        const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:uid="http://www.uid.admin.ch/xmlns/uid-wse">
    <soapenv:Header/>
    <soapenv:Body>
        <uid:ValidateVatNumber>
            <uid:vatNumber>${vatNumber}</uid:vatNumber>
        </uid:ValidateVatNumber>
    </soapenv:Body>
</soapenv:Envelope>
`.trim();

        const options = {
            hostname: "www.uid-wse-a.admin.ch",
            path: "/V5.0/PublicServices.svc",
            method: "POST",
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "Content-Length": Buffer.byteLength(soapEnvelope),
                "SOAPAction": "http://www.uid.admin.ch/xmlns/uid-wse/IPublicServices/ValidateVatNumber"
            },
            timeout: 10000,
        };

        return new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => {
                    console.log(`[CH VAT] Response status: ${res.statusCode}`);
                    if (res.statusCode !== 200) {
                        console.error(`[CH VAT] HTTP error: ${res.statusCode}`);
                        return resolve({
                            validated: false,
                            details: `HTTP error: ${res.statusCode}`,
                            serviceError: true
                        });
                    }
                    if (data.includes("<s:Fault>") || data.includes("<soap:Fault>")) {
                        let error = "Unknown SOAP error";
                        if (data.includes("Data_validation_failed")) {
                            error = "Data_validation_failed";
                        } else if (data.includes("Request_limit_exceeded")) {
                            error = "Request_limit_exceeded";
                        }
                        return resolve({
                            validated: false,
                            details: `SOAP error: ${error}`,
                            serviceError: true
                        });
                    }
                    const resultMatch = data.match(/<ValidateVatNumberResult>(true|false)<\/ValidateVatNumberResult>/);
                    if (resultMatch) {
                        const validated = resultMatch[1] === "true";
                        return resolve({
                            validated,
                            details: validated ? "VAT number is valid and active" : "VAT number is invalid",
                            serviceError: false
                        });
                    }
                    return resolve({
                        validated: false,
                        details: "Unexpected response from Swiss VAT service",
                        serviceError: true
                    });
                });
            });

            req.on("error", (e) => {
                console.error("[CH VAT] Request error:", e.message);
                resolve({
                    validated: false,
                    details: "Error with Swiss VAT service: " + e.message,
                    serviceError: true
                });
            });

            req.write(soapEnvelope);
            req.end();
        });
    }
}