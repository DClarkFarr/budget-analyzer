import { useMemo } from "react";

const styleMap = {
  error: "bg-red-100 text-red-700 border-red-600",
  success: "bg-emerald-100 text-emerald-700 border-emerald-600",
  info: "bg-sky-100 text-sky-700 border-sky-600",
};
export default function Alert({
  children,
  style = "info",
}: {
  children: React.ReactNode;
  style?: "error" | "success" | "info";
}) {
  const clsList = useMemo(() => {
    return styleMap[style];
  }, [style]);

  return (
    <div
      className={`alert px-4 py-3 rounded-lg shadow border border-2 ${clsList}`}
    >
      {children}
    </div>
  );
}
