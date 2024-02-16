"use client";

import { Category, CategoryFormState } from "@/types/Statement";
import { useEffect, useMemo, useState, useTransition } from "react";
import CreateCategoryModal from "./CreateCategoryModal";
import { DateTime } from "luxon";
import {
    FaRegListAlt,
    FaPencilAlt,
    FaTrash,
    FaCircleNotch,
} from "react-icons/fa";
import Link from "next/link";
import { useCategoryTotals } from "@/hooks/useCategoryTotals";
import { formatCurrency } from "@/methods/currency";
import { useConfirmModal } from "../Control/ConfirmModal";
import { useModalContext } from "../Providers/ModalProvider";

const Spinner = () => <FaCircleNotch className="animate-spin" />;

export default function CategoryList({
    categories,
    onCreateCategory,
    onDeleteCategory,
    onUpdateCategory,
}: {
    categories: Category[];
    onCreateCategory: (data: CategoryFormState) => Promise<void>;
    onDeleteCategory: (categoryId: number) => Promise<void>;
    onUpdateCategory: (
        categoryId: number,
        data: CategoryFormState
    ) => Promise<void>;
}) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [, transition] = useTransition();

    const categoryIds = useMemo(() => {
        return categories.map((c) => c.id);
    }, [categories, categories.length]);

    const { totals: categoryTotals } = useCategoryTotals(categoryIds);

    const onHideCategoryModal = () => {
        setShowCategoryModal(false);
        setSelectedCategory(null);
    };

    const onCreateCategoryWrapped = async (data: CategoryFormState) => {
        await onCreateCategory(data);
        onHideCategoryModal();
    };

    const onUpdateCategoryWrapped = async (
        categoryId: number,
        data: CategoryFormState
    ) => {
        await onUpdateCategory(categoryId, data);
        onHideCategoryModal();
        setSelectedCategory(null);
    };

    const onSubmitCategoryModal = async (data: CategoryFormState) => {
        if (selectedCategory) {
            await onUpdateCategoryWrapped(selectedCategory.id, data);
        } else {
            await onCreateCategoryWrapped(data);
        }
    };

    const onDeleteCategoryWrapped = async (categoryId: number) => {
        setDeletingId(categoryId);
        await onDeleteCategory(categoryId);
        transition(() => {
            setDeletingId(null);
        });
    };

    const onEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setShowCategoryModal(true);
    };

    const { showConfirmModal, onClickClose, onClickConfirm } =
        useConfirmModal();

    const onClickDeleteCategory = async (category: Category) => {
        showConfirmModal(`delete-cateogry-${category.id}`, {
            show: true,
            title: "Really delete category?",
            message: `Are you sure you want to delete category "${category.name}"?`,
            accept: "Delete",
            onConfirm: async () => {
                onClickConfirm(`delete-cateogry-${category.id}`, async () => {
                    await onDeleteCategoryWrapped(category.id);
                });
            },
            onClose: async () => {
                onClickClose(`delete-cateogry-${category.id}`, async () => {});
            },
        });
    };

    return (
        <div className="categories">
            <CreateCategoryModal
                category={selectedCategory}
                show={showCategoryModal}
                onClose={onHideCategoryModal}
                onSubmit={onSubmitCategoryModal}
            />
            <div className="lg:flex items-center gap-x-4 mb-4">
                <div>
                    <h2 className="text-xl">Account Categories</h2>
                    <p className="lead mb-4">
                        Each category is a collection of transactions, gathered
                        by rules you create.
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        className="btn btn-primary"
                        onClick={() => (
                            setShowCategoryModal(true),
                            setSelectedCategory(null)
                        )}
                    >
                        Add Category
                    </button>
                </div>
            </div>
            <div className="categories flex flex-col w-full gap-y-2">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category flex w-full gap-x-3 items-center p-3 bg-slate-50"
                    >
                        <div className="w-1/3">
                            <div className="category__name text-lg">
                                {category.name}
                            </div>
                            <div>
                                {!category.startAt && !category.endAt && (
                                    <span>No Time Range</span>
                                )}
                                {(category.startAt || category.endAt) && (
                                    <>
                                        <span className="pr-2">
                                            Start:{" "}
                                            <b>
                                                {category.startAt
                                                    ? DateTime.fromISO(
                                                          category.startAt
                                                      ).toFormat("DD")
                                                    : "-"}
                                            </b>
                                        </span>
                                        <span className="pl-2">
                                            End:{" "}
                                            <b>
                                                {category.endAt
                                                    ? DateTime.fromISO(
                                                          category.endAt
                                                      ).toFormat("DD")
                                                    : "-"}
                                            </b>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="">{category.type}</div>
                        <div className="">
                            <div className="flex gap-x-2 text-center">
                                <div>
                                    <div className="text-green-600">
                                        {formatCurrency(
                                            categoryTotals?.[category.id]
                                                ?.incoming || 0
                                        )}
                                    </div>
                                    Income
                                </div>
                                <div>
                                    <div className="text-red-600">
                                        {formatCurrency(
                                            categoryTotals?.[category.id]
                                                ?.outgoing || 0
                                        )}
                                    </div>
                                    <div>Expense</div>
                                </div>
                                <div>
                                    <div
                                        className={`${
                                            (categoryTotals?.[category.id]
                                                ?.net || 0) >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {formatCurrency(
                                            categoryTotals?.[category.id]
                                                ?.net || 0
                                        )}
                                    </div>
                                    <div>Net</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">
                                        {categoryTotals?.[category.id]?.count ||
                                            0}
                                    </div>
                                    <div>Count</div>
                                </div>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <div className="flex gap-x-2">
                                <div>
                                    <Link
                                        href={`/dashboard/account/${category.accountId}/category/${category.id}`}
                                        className="btn btn-sm bg-slate-200 text-slate-800 flex items-center gap-x-1"
                                    >
                                        <FaRegListAlt /> <span>View</span>
                                    </Link>
                                </div>
                                <div>
                                    <button
                                        onClick={() => onEditCategory(category)}
                                        className="btn btn-icon text-sky-600"
                                    >
                                        <FaPencilAlt />
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className="btn btn-icon text-red-600"
                                        onClick={() =>
                                            onClickDeleteCategory(category)
                                        }
                                    >
                                        {deletingId === category.id ? (
                                            <Spinner />
                                        ) : (
                                            <FaTrash />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
