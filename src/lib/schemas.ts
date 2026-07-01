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

export const updateClientSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("updateStage"),
    stage: dealStageSchema,
  }),
  z.object({
    action: z.literal("addNote"),
    note: z.string().trim().min(1, "Note cannot be empty"),
  }),
  z.object({
    action: z.literal("toggleDocument"),
    documentId: z.string().trim().min(1, "Document ID is required"),
    complete: z.boolean(),
  }),
]);

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const addClientFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: z.string().trim().min(7, "Phone number is required"),
    propertyType: z.enum(["buyer", "seller", "both"]),
    budgetMin: z
      .string()
      .trim()
      .min(1, "Minimum budget is required")
      .refine((value) => !Number.isNaN(Number(value)), "Enter a valid minimum budget")
      .transform(Number)
      .pipe(z.number().nonnegative("Minimum budget must be zero or greater")),
    budgetMax: z
      .string()
      .trim()
      .min(1, "Maximum budget is required")
      .refine((value) => !Number.isNaN(Number(value)), "Enter a valid maximum budget")
      .transform(Number)
      .pipe(z.number().positive("Maximum budget must be greater than zero")),
    address: z.string().trim().optional(),
    searchCriteria: z.string().trim().optional(),
    firstNote: z.string().trim().optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

export type AddClientFormValues = z.input<typeof addClientFormSchema>;
export type AddClientFormOutput = z.output<typeof addClientFormSchema>;
