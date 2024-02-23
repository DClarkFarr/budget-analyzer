"use client";
import { Account, AccountFormState } from "@/types/Account";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import FormError from "../Form/FormError";
import Alert from "../Control/Alert";

type AccountFormProps = {
  onSubmit: (data: AccountFormState) => Promise<Account>;
  onSuccess: (account: Account) => void;
  initialState?: Partial<AccountFormState>;
  edit?: boolean;
};

export default function AccountForm({
  onSubmit,
  onSuccess,
  initialState,
  edit = false,
}: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ success: false, message: "" });

  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
    getValues,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: { name: "", color: "#000000", ...initialState },
  });

  const [colorReadonly, setColorReadonly] = useState(getValues("color"));

  const onSubmitForm = () => {
    return handleSubmit(async (data: AccountFormState) => {
      setIsSubmitting(true);
      setAlert({ success: false, message: "" });

      try {
        const created = await onSubmit(data);
        onSuccess(created);
        reset();

        setAlert({
          success: true,
          message: edit
            ? "Account updated successfully"
            : "Account created successfully",
        });
      } catch (err) {
        if (err instanceof AxiosError) {
          setAlert({
            success: false,
            message: err.response?.data?.message || err.message,
          });
        } else if (err instanceof Error) {
          setAlert({ success: false, message: err.message });
        }
      }

      setIsSubmitting(false);
    });
  };

  return (
    <form action="" className="account-form max-w-[600px]">
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          className="form-control"
          {...register("name", { required: "Name is required" })}
        />

        {errors.name && <FormError message={errors.name.message || ""} />}
      </div>

      <div className="form-group">
        <label>Color</label>
        <div className="flex w-full items-center">
          <div className="shrink">
            <input
              type="color"
              {...register("color", {
                required: "Color is required",
                onChange: (e) => {
                  setColorReadonly(e.target.value);
                },
              })}
            />
          </div>
          <div className="grow">
            <input
              type="text"
              className="form-control"
              readOnly
              value={colorReadonly}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={onSubmitForm()}
          disabled={!isValid || isSubmitting}
        >
          {edit ? "Update" : "Create"}
        </button>
      </div>

      {alert.message.length > 0 && (
        <Alert style={alert.success ? "success" : "error"}>
          {alert.message}
        </Alert>
      )}
    </form>
  );
}
