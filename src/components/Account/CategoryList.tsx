import { Category, CategoryFormState } from "@/types/Statement";
import { useState } from "react";
import CreateCategoryModal from "./CreateCategoryModal";
import AccountService from "@/services/AccountService";

export default function CategoryList({
  accountId,
  categories,
  onCreateCategory,
}: {
  accountId: number;
  categories: Category[];
  onCreateCategory: (data: CategoryFormState) => Promise<void>;
}) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const onHideCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const onCreateCategoryWrapped = async (data: CategoryFormState) => {
    await onCreateCategory(data);
    setShowCategoryModal(false);
  };

  return (
    <div className="categories">
      <CreateCategoryModal
        show={showCategoryModal}
        onClose={onHideCategoryModal}
        onSubmit={onCreateCategoryWrapped}
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
