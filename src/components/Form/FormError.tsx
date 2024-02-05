export default function FormError({ message }: { message: string }) {
    return <div className="form-error text-red-700 mb-2">{message}</div>;
}
