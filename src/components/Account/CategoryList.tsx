import { Category } from "@/types/Statement";

export default function CategoryList({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div className="categories">
      <div className="lg:flex items-center gap-x-4">
        <div>
          <h2 className="text-xl">Account Categories</h2>
          <p className="lead mb-4">
            Each category is a collection of transactions, gathered by rules you
            create.
          </p>
        </div>
        <div>
          <button className="btn btn-primary">Add Category</button>
        </div>
      </div>
    </div>
  );
}
