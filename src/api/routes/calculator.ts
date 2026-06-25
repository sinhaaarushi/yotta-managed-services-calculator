import { Router } from "express";
import { calculate } from "../../engine/calculator.js";
import { calculatePhase1 } from "../../engine/phase1.js";
import { RATE_CARD } from "../../config/rate-cards.js";
import type { CalculatorInput } from "../../types/index.js";
import { parsePhase1Body } from "../normalize.js";

export function createCalculatorRouter(): Router {
  const router = Router();

  router.get("/rate-card", (_req, res) => {
    res.json(RATE_CARD);
  });

  router.post("/calculate", (req, res) => {
    try {
      const input = req.body as CalculatorInput;
      if (!input?.cloudType) {
        res.status(400).json({ error: "cloudType is required" });
        return;
      }
      res.json(calculate(input));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Calculation failed";
      res.status(400).json({ error: message });
    }
  });

  router.post("/phase1/calculate", (req, res) => {
    try {
      const input = parsePhase1Body(req.body);
      res.json(calculatePhase1(input));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Calculation failed";
      res.status(400).json({ error: message });
    }
  });

  return router;
}
