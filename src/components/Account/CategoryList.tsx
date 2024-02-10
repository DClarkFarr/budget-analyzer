"use client";

import { Category, CategoryFormState } from "@/types/Statement";
import { useState, useTransition } from "react";
import CreateCategoryModal from "./CreateCategoryModal";
import { DateTime } from "luxon";
import {
    FaRegListAlt,
    FaPencilAlt,
    FaTrash,
    FaCircleNotch,
} from "react-icons/fa";
import Link from "next/link";

const Spinner = () => <FaCircleNotch className="animate-spin" />;

export default function CategoryList({
    categories,
    onCreateCategory,
    onDeleteCategory,
}: {
    categories: Category[];
    onCreateCategory: (data: CategoryFormState) => Promise<void>;
    onDeleteCategory: (categoryId: number) => Promise<void>;
}) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [, transition] = useTransition();

    const onHideCategoryModal = () => {
        setShowCategoryModal(false);
        setSelectedCategory(null);
    };

    const onCreateCategoryWrapped = async (data: CategoryFormState) => {
        await onCreateCategory(data);
        onHideCategoryModal();
    };

    const onDeleteCategoryWrapped = (categoryId: number) => {
        setDeletingId(categoryId);
        transition(() => {
            onDeleteCategory(categoryId);
            setDeletingId(null);
        });
    };

    const onEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setShowCategoryModal(true);
    };

    return (
        <div className="categories">
            <CreateCategoryModal
                category={selectedCategory}
                show={showCategoryModal}
                onClose={onHideCategoryModal}
                onSubmit={onCreateCategoryWrapped}
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
                        className="category flex w-full items-center p-3 bg-slate-50"
                    >
                        <div className="shrink w-1/2">
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
                        <div className="shrink">{category.type}</div>
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
                                            onDeleteCategoryWrapped(category.id)
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
