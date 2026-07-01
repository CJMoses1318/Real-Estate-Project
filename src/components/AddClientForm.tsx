"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  addClientFormSchema,
  type AddClientFormOutput,
  type AddClientFormValues,
} from "@/lib/schemas";

const defaultValues: AddClientFormValues = {
  name: "",
  email: "",
  phone: "",
  propertyType: "buyer",
  budgetMin: "",
  budgetMax: "",
  address: "",
  searchCriteria: "",
  firstNote: "",
};

export interface AddClientFormProps {
  disabled?: boolean;
  onSuccess?: (clientId: string) => void;
}

export function AddClientForm({ disabled, onSuccess }: AddClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddClientFormValues, unknown, AddClientFormOutput>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          propertyType: values.propertyType,
          budgetMin: values.budgetMin,
          budgetMax: values.budgetMax,
          address: values.address || undefined,
          searchCriteria: values.searchCriteria || undefined,
          firstNote: values.firstNote || undefined,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to create client";
        setError("root", { message });
        return;
      }

      reset(defaultValues);

      if (
        typeof data === "object" &&
        data !== null &&
        "id" in data &&
        typeof data.id === "string"
      ) {
        onSuccess?.(data.id);
      } else {
        onSuccess?.("");
      }
    } catch {
      setError("root", { message: "Failed to create client" });
    }
  });

  const fieldClassName =
    "rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => void onSubmit(event)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Full name</span>
          <input
            type="text"
            {...register("name")}
            className={fieldClassName}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? (
            <span className="text-sm text-red-600">{errors.name.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            type="email"
            {...register("email")}
            className={fieldClassName}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <span className="text-sm text-red-600">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Phone</span>
          <input
            type="tel"
            {...register("phone")}
            className={fieldClassName}
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? (
            <span className="text-sm text-red-600">{errors.phone.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Property type</span>
          <select
            {...register("propertyType")}
            className={fieldClassName}
            aria-invalid={Boolean(errors.propertyType)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="both">Both</option>
          </select>
          {errors.propertyType ? (
            <span className="text-sm text-red-600">
              {errors.propertyType.message}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Minimum budget</span>
          <input
            type="number"
            min="0"
            {...register("budgetMin")}
            className={fieldClassName}
            aria-invalid={Boolean(errors.budgetMin)}
          />
          {errors.budgetMin ? (
            <span className="text-sm text-red-600">{errors.budgetMin.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Maximum budget</span>
          <input
            type="number"
            min="1"
            {...register("budgetMax")}
            className={fieldClassName}
            aria-invalid={Boolean(errors.budgetMax)}
          />
          {errors.budgetMax ? (
            <span className="text-sm text-red-600">{errors.budgetMax.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700">Property address</span>
          <input type="text" {...register("address")} className={fieldClassName} />
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700">Search criteria</span>
          <input
            type="text"
            {...register("searchCriteria")}
            className={fieldClassName}
          />
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700">First note</span>
          <textarea
            rows={3}
            {...register("firstNote")}
            className={fieldClassName}
          />
        </label>
      </div>

      {errors.root ? (
        <p className="text-sm text-red-600" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating client..." : "Create client"}
      </button>
    </form>
  );
}
