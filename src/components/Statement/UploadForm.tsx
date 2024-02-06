"use client";
import {
  StatementType,
  StatementTypes,
  UploadStatementPayload,
  UploadStatementResponse,
} from "@/types/Statement";
import { useForm } from "react-hook-form";
import FormError from "../Form/FormError";
import { useState } from "react";
import StatementService from "@/services/StatementService";
import { AxiosError } from "axios";
import Alert from "../Control/Alert";

type UploadFormState = {
  file?: FileList | null;
  type: StatementType;
};

type UploadFormProps = {
  initialState?: Partial<UploadFormState>;
  onSubmit?: (data: UploadStatementPayload) => Promise<UploadStatementResponse>;
  onSuccess?: (data: UploadStatementResponse) => void;
};

const uploadTypes = Object.values(StatementTypes) as StatementType[];
const uploadOptions = uploadTypes.map((type) => {
  const map = {
    wells_fargo: "Wells Fargo",
    venmo: "Venmo",
  };

  return {
    label: map[type],
    value: type,
  };
});
export default function UploadForm(props: UploadFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: props.initialState,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formAlert, setFormAlert] = useState({
    success: false,
    message: "",
  });

  const clearFormAlert = () => {
    setFormAlert({ success: false, message: "" });
  };

  const onSubmitForm = () => {
    return handleSubmit(async (data) => {
      const submitMethod = props.onSubmit
        ? props.onSubmit
        : StatementService.uploadStatement;
      const successMethod = props.onSuccess
        ? props.onSuccess
        : (response: UploadStatementResponse) => {
            setFormAlert(response);
          };

      setIsSubmitting(true);

      clearFormAlert();

      try {
        const response = await submitMethod({
          type: data.type!,
          file: data.file?.[0]!,
        });

        successMethod(response);
      } catch (err) {
        if (err instanceof AxiosError) {
          setFormAlert({
            success: false,
            message: err.response?.data?.message || err.message,
          });
        } else if (err instanceof Error) {
          setFormAlert({
            success: false,
            message: err.message,
          });
        }
      }

      setIsSubmitting(false);
    });
  };
  return (
    <div className="upload-form max-w-[600px]">
      <form onSubmit={onSubmitForm()}>
        <div className="form-group">
          <label>Select Upload Type</label>
          <select
            {...register("type", {
              validate: (value) => {
                return (
                  (value && uploadTypes.includes(value)) ||
                  "Please select a valid type"
                );
              },
            })}
            className="form-control"
          >
            {uploadOptions.map((type) => {
              return (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              );
            })}
          </select>
          {errors.type?.message && <FormError message={errors.type.message} />}
        </div>

        <div className="form-group">
          <label>Select *.csv File</label>
          <input
            {...register("file", {
              required: true,
              validate: (value) => {
                return (
                  (value?.length && value[0].type === "text/csv") ||
                  "Please select a valid CSV file"
                );
              },
            })}
            type="file"
            className="form-control"
            accept=".csv"
          />

          {errors.file?.message && <FormError message={errors.file.message} />}
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>

        {formAlert.message.length > 0 && (
          <div className="mt-4">
            <Alert style={formAlert.success ? "success" : "error"}>
              {formAlert.message}
            </Alert>
          </div>
        )}
      </form>
    </div>
  );
}
