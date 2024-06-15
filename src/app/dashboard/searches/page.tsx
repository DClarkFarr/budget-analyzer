import SearchesManager from "@/components/Searches/SearchesManager";

export default async function SearchesPage({ params }: { params: {} }) {
    return (
        <div className="account-dashboard__search">
            <SearchesManager />
        </div>
    );
}
