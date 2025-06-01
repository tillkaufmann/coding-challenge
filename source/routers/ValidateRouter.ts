import { Router } from "express";
import { z } from "zod";
import { Configuration } from "../models/ConfigurationModel.js";
import {ValidateVatRequestBody} from "../models/RequestModel.js";
import ValidateController from "../controllers/ValidateController.js";
import {VatValidationService} from "../service/VatValidationService.js";
import {EuVatService} from "../service/EuVatService.js";
import {ChVatService} from "../service/ChVatService.js";

const validateVatSchema = z.object({
    countryCode: z.string().length(2),
    vat: z.string().min(1),
});

const ValidateRouter = (configuration: Configuration, vatService?: VatValidationService): Router => {
    const router = Router({ caseSensitive: true, strict: true });
    if (!vatService){
        const vatEUService = new EuVatService()
        const vatCHService = new ChVatService();
        vatService = new VatValidationService(vatEUService, vatCHService);
    }
    const validateController = new ValidateController(configuration, vatService);

    router.post("/validate/vat", async (req, res) => {
        const body = req.body as ValidateVatRequestBody;
        const result = validateVatSchema.safeParse(body);
        if (!result.success) {
            const errorMessage = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
            console.debug("invalid request body", errorMessage);
            return res.status(400).json({ validated: false, details: errorMessage });
        }
        const validationResult = await validateController.validateVatRequest(body.countryCode, body.vat);

        if (!validationResult.valid) {
            console.debug(`validation failed:  ${validationResult.message}`);
            return res.status(validationResult.returnCode).json({
                validated: false,
                details: validationResult.message || "Validation failed",
            });
        }else{
            return res.status(200).json({ validated: true, details: "OK" });
        }
    });

    return router;
};

export default ValidateRouter;