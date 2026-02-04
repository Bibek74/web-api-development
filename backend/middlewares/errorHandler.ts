import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof ZodError) {
        res.status(400).send({
            message: "Validation error",
            errors: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            })),
            success: false
        });
        return;
    }

    res.status(500).send({
        message: err.message ?? "Internal server error",
        success: false
    });
};
