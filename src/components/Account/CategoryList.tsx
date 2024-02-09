import { Category } from "@/types/Statement";
import { useState } from "react";
import CreateCategoryModal from "./CreateCategoryModal";

export default function CategoryList({
  categories,
}: {
  categories: Category[];
}) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const onHideCategoryModal = () => {
    setShowCategoryModal(false);
  };

  return (
    <div className="categories">
      <CreateCategoryModal
        show={showCategoryModal}
        onClose={onHideCategoryModal}
      />
      <div className="lg:flex items-center gap-x-4">
        <div>
          <h2 className="text-xl">Account Categories</h2>
          <p className="lead mb-4">
            Each category is a collection of transactions, gathered by rules you
            create.
          </p>
        </div>
        <div className="ml-auto">
          <button
            className="btn btn-primary"
            onClick={() => setShowCategoryModal(true)}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}
