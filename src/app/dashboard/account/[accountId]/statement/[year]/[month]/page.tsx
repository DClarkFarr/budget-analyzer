import MonthlyStatement from "@/components/Statement/MonthlyStatement";

export default async function MonthlyStatementPage({
    params: { accountId, year, month },
}: {
    params: { accountId: string; year: string; month: string };
}) {
    return (
        <div className="statement--page">
            <MonthlyStatement
                accountId={parseInt(accountId)}
                year={parseInt(year)}
                month={parseInt(month)}
            />
        </div>
    );
}
