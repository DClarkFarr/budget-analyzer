import UploadForm from "@/components/Statement/UploadForm";

export default async function UploadStatementPage() {
  return (
    <div className="upload">
      <h2 className="text-2xl mb-1">Upload Bank Statement</h2>
      <p className="mb-4">
        Duplicate records from previous entries will be skipped.
      </p>

      <UploadForm />
    </div>
  );
}
