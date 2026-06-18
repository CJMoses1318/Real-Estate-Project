import { z } from "zod";

import { DEAL_STAGES } from "./types";

export const createClientSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().min(7, "Phone number is required"),
    propertyType: z.enum(["buyer", "seller", "both"]),
    budgetMin: z.number().nonnegative("Minimum budget must be zero or greater"),
    budgetMax: z.number().positive("Maximum budget must be greater than zero"),
    address: z.string().trim().optional(),
    searchCriteria: z.string().trim().optional(),
    firstNote: z.string().trim().optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

export const dealStageSchema = z.enum(DEAL_STAGES);
