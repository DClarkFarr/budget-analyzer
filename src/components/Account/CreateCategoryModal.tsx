"use client";

import { Button, Modal } from "flowbite-react";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import FormError from "../Form/FormError";
import { Category, CategoryFormState, CategoryType } from "@/types/Statement";
import { FaCircleNotch } from "react-icons/fa";
import Alert from "../Control/Alert";

export default function CreateCategoryModal({
  show,
  onClose,
  onSubmit,
  category = null,
}: {
  show: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: CategoryFormState) => Promise<void>;
}) {
  const options = [
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
    { label: "Ignore", value: "ignore" },
  ];

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    getValues,
    formState: { errors, isValid, isLoading },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      type: "expense" as CategoryType,
      startAt: "",
      endAt: "",
    },
  });

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("type", category.type);
      setValue(
        "startAt",
        category.startAt
          ? DateTime.fromISO(category.startAt).toSQLDate() || ""
          : ""
      );
      setValue(
        "endAt",
        category.endAt ? DateTime.fromISO(category.endAt).toSQLDate() || "" : ""
      );
    }
  }, [category, setValue]);

  const endOfYear = DateTime.local().endOf("year").toSQLDate();

  const submitHandler = () => {
    return handleSubmit(async (data) => {
      setErrorMessage("");
      try {
        await onSubmit(data);
        reset();
      } catch (err) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        }
      }
    });
  };

  const onClickSubmit = () => {
    if (isValid) {
      buttonRef.current?.click();
    }
  };

  const onCloseWrapper = () => {
    onClose();
    reset();
  };

  return (
    <>
      <Modal show={show} onClose={onCloseWrapper}>
        <Modal.Header>Create Category</Modal.Header>
        <Modal.Body>
          <div className="">
            <form className="w-full" onSubmit={submitHandler()}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  {...register("name", { required: true, minLength: 2 })}
                  type="text"
                  className="form-control"
                  placeholder="Income 2023, Company Expenses, etc"
                />
                {errors.name && (
                  <FormError message="Category name is required" />
                )}
              </div>
              <div className="form-group">
                <label>Category Type</label>
                <select
                  className="form-control"
                  {...register("type", { required: true })}
                >
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <FormError message="Category type is required" />
                )}
              </div>
              <div className="lg:flex gap-x-4 w-full">
                <div className="lg:w-1/2">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      min="2020-01-01"
                      {...register("startAt", {
                        required: false,
                        validate: (value) => {
                          if (!value) return true;

                          const isValid = DateTime.fromISO(value).isValid;
                          if (!isValid) {
                            return "Invalid date";
                          }

                          const endAt = getValues("endAt");

                          if (
                            endAt &&
                            DateTime.fromISO(endAt) < DateTime.fromISO(value)
                          ) {
                            return "Start date must be before end date";
                          }

                          return true;
                        },
                      })}
                    />

                    {errors.startAt && (
                      <FormError message={errors.startAt.message} />
                    )}
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      max={endOfYear}
                      {...register("endAt", {
                        required: false,
                        validate: (value) => {
                          if (!value) return true;

                          const isValid = DateTime.fromISO(value).isValid;
                          if (!isValid) {
                            return "Invalid date";
                          }

                          const startAt = getValues("startAt");

                          if (
                            startAt &&
                            DateTime.fromISO(startAt) > DateTime.fromISO(value)
                          ) {
                            return "End date must be after start date";
                          }

                          return true;
                        },
                      })}
                    />

                    {errors.endAt && (
                      <FormError message={errors.endAt.message} />
                    )}
                  </div>
                </div>
              </div>
              {errorMessage && <Alert style="error">{errorMessage}</Alert>}

              <div className="hidden">
                <button ref={buttonRef} type="submit"></button>
              </div>
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClickSubmit} disabled={!isValid || isLoading}>
            {isLoading && <FaCircleNotch className="animate-spin mr-2" />}
            {!isLoading && (category ? "Update" : "Create") + " Category"}
          </Button>
          <Button color="gray" onClick={onCloseWrapper}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
