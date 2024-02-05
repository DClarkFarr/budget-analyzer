"use client";
import { validateEmail } from "@/_server/methods/validate";
import { User } from "@/types/User";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormError from "../Form/FormError";
import UserOauthService from "@/services/UserOauthService";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export type LoginFormState = {
  email: string;
  password: string;
};
export type LoginFormProps = {
  initialState?: Partial<LoginFormState>;
  redirect?: string;
  onSubmit?: (data: LoginFormState) => Promise<User>;
  onSuccess?: (user: User) => void;
};
export default function LoginForm(props: LoginFormProps) {
  const [state] = useState<LoginFormState>({
    email: "",
    password: "",
    ...props.initialState,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: state,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { push } = useRouter();

  const onFormSubmit = () => {
    return handleSubmit(async (data) => {
      setIsSubmitting(true);

      const submitMethod =
        typeof props.onSubmit === "function"
          ? props.onSubmit
          : UserOauthService.login;

      try {
        const user = await submitMethod(data);
        if (typeof props.onSuccess === "function") {
          props.onSuccess(user);
        } else if (props.redirect) {
          push(props.redirect);
        } else {
          console.warn("User logged in, but no callback for success given");
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error("Error logging in user", err, err.response?.data);
        }
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    });
  };

  return (
    <form onSubmit={onFormSubmit()} className="max-w-full w-[400px]">
      <div className="form-group">
        <label className="block">Email</label>
        <input
          {...register("email", {
            required: true,
            validate: (v) => validateEmail(v) || "Please use a valid email",
          })}
          placeholder="Email address"
          className="form-control"
        />
        {errors.email?.message && <FormError message={errors.email.message} />}
      </div>
      <div className="form-group">
        <label className="block">Password</label>
        <input
          {...register("password", {
            required: "Password must have 6+ chars",
            minLength: 6,
          })}
          placeholder="******"
          type="password"
          className="form-control"
        />
        {errors.password?.message && (
          <FormError message={errors.password.message} />
        )}
      </div>

      <div className="pt-2">
        <button
          className="btn block w-full bg-sky-700"
          type="submit"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </div>
    </form>
  );
}
