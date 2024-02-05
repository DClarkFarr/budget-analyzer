"use client";
import { StatementType, StatementTypes } from "@/types/Statement";
import { useForm } from "react-hook-form";
import FormError from "../Form/FormError";
import { useState } from "react";

type UploadFormState = {
  file?: FileList | null;
  type: StatementType;
};

type UploadFormPayload = {
  type: StatementType;
  file: File;
};
type SuccessPayload = {
  message: string;
};
type UploadFormProps = {
  initialState?: Partial<UploadFormState>;
  onSubmit?: (data: UploadFormPayload) => Promise<void>;
  onSuccess?: (data: SuccessPayload) => void;
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

  const onSubmitForm = () => {
    return handleSubmit(async (data) => {
      setIsSubmitting(true);
      console.log("got data", data);

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
      </form>
    </div>
  );
}
