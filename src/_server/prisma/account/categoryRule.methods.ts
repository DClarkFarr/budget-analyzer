import {
  Category,
  CategoryRule,
  CategoryRuleFormState,
} from "@/types/Statement";
import { prisma } from "../index";
import toApiResponse from "@/server/methods/response/toApiResponse";
import { getAccountTransactions } from "./statement.methods";
import { keyBy } from "lodash-es";
import UserError from "@/server/exceptions/UserException";
import { getCategory } from "./category.methods";
import { Transaction } from "@/types/Account/Transaction";
import { AccountTransaction, CategoryTransactions } from "@prisma/client";

export async function getCategoryTransactions(categoryId: number) {
  const category = (await getCategory(categoryId))!;

  const params: (string | number)[] = [categoryId];
  if (category.startAt) {
    params.push(category.startAt);
  }
  if (category.endAt) {
    params.push(category.endAt);
  }

  const query = `
      SELECT 
        t.* 
      FROM AccountTransaction t
      JOIN CategoryTransactions ct ON ct.transactionId = t.id
      WHERE ct.categoryId = ?
      AND ct.ignoredAt IS NULL
      ${category.startAt ? "AND t.date >= ? " : ""}
      ${category.endAt ? "AND t.date <= ? " : ""}
      AND EXISTS(
        SELECT c.id FROM Category c
        WHERE c.id = ct.categoryId
        AND c.deletedAt IS NULL
      )
    `;

  const rawTransactions = await prisma.$queryRawUnsafe<AccountTransaction[]>(
    query,
    ...params
  );

  const matched = rawTransactions.filter((t) =>
    t.description.toLocaleLowerCase().includes("audible")
  );

  return rawTransactions.map((t) =>
    toApiResponse<Transaction>(t, {
      intKeys: ["id", "accountId", "userId"],
      dateKeys: ["date", "createdAt"],
      floatKeys: ["amount"],
    })
  );
}

export async function getCategoryTransactionPivots(
  categoryId: number,
  { excludeSet = false }: { excludeSet?: boolean } = {}
) {
  const rows = await prisma.categoryTransactions.findMany({
    where: { categoryId, setAt: excludeSet ? null : undefined },
  });

  return rows;
}

export function ruleMatchesTransaction<T extends Transaction>(
  rule: CategoryRule,
  transaction: T
) {
  let isMatched = false;
  if (
    !rule.transactionType ||
    rule.transactionType === transaction.expenseType
  ) {
    try {
      const regExp = new RegExp(rule.rule, "i");

      isMatched = regExp.test(transaction.description);
    } catch {
      isMatched = transaction.description
        .toLowerCase()
        .includes(rule.rule.toLowerCase());
    }
  }

  return isMatched;
}

export async function syncCategoryRuleTransactions(
  category: Category,
  rule?: CategoryRule
) {
  /**
   * Filter out the rule in question, if there is one
   */
  const rules = (await getCategoryRules(category.id)).filter((c) => {
    return !rule || c.id !== rule.id;
  });

  const toAdd: number[] = []; // transaction ids
  const toRemove: number[] = []; // categoryTransaction ids

  const transactions = await getAccountTransactions(category.accountId, {
    includeCategoryPivots: true,
    minDate: category.startAt || undefined,
    maxDate: category.endAt || undefined,
  });

  transactions.forEach((t) => {
    const pivots = t.categories.reduce(
      (acc, c) => {
        if (c.setAt) {
          /**
           * If it was set for any category, then we shouldn't touch it
           */
          acc.wasSet = true;
        }

        if (c.categoryId === category.id) {
          if (c.ignoredAt) {
            /**
             * If it was ignored in the same category, we won't touch it unless the rule in question is a match
             */
            acc.wasIgnored.push(c);
          } else {
            /**
             * Only set if was matched for this category
             */
            acc.wasMatched.push(c);
          }
        }

        return acc;
      },
      {
        wasIgnored: [] as CategoryTransactions[],
        wasMatched: [] as CategoryTransactions[],
        wasSet: false,
      }
    );

    let isMatchedByOthers = false;
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (ruleMatchesTransaction(r, t)) {
        isMatchedByOthers = true;
        break;
      }
    }

    let isMatchedByThis = false;
    if (rule) {
      isMatchedByThis = ruleMatchesTransaction(rule, t);
    }

    if (pivots.wasSet) {
      // console.log("transaction was set", t);
      // do nothing
    } else {
      if (pivots.wasIgnored.length) {
        // If it was ignored, we don't care if it was matched.
        // We only care if it was matched by the rule in question.
        // Don't remove if it was ignored
        if (isMatchedByThis) {
          /**
           * The altered rule matches the transaction.
           * So we can remove other ignored rows for this category
           */
          toRemove.push(...pivots.wasIgnored.map((c) => c.id));
          toAdd.push(t.id);
        }
      } else if (
        !pivots.wasMatched.length &&
        (isMatchedByOthers || isMatchedByThis)
      ) {
        /**
         * If it wasn't matched by any rule, we add it
         */
        toAdd.push(t.id);
      } else if (
        pivots.wasMatched.length &&
        !(isMatchedByOthers || isMatchedByThis)
      ) {
        /**
         * Old records that aren't matched anymore.
         * Remove
         */

        console.log("removing", ...pivots.wasMatched.map((c) => c.id));
        toRemove.push(...pivots.wasMatched.map((c) => c.id));
      }
    }
  });

  await prisma.categoryTransactions.deleteMany({
    where: {
      id: {
        in: toRemove,
      },
      categoryId: category.id,
    },
  });

  console.log("to add", toAdd);
  await Promise.all(
    toAdd.map((transactionId) => {
      return prisma.categoryTransactions.upsert({
        where: {
          category_transaction: {
            categoryId: category.id,
            transactionId,
          },
        },
        update: {
          ignoredAt: null,
        },
        create: {
          categoryId: category.id,
          transactionId,
          ignoredAt: null,
        },
      });
    })
  );

  return [toAdd, toRemove];
}

export async function createCategoryRule(
  category: Category,
  data: CategoryRuleFormState
) {
  if (!data.name || data.name.length < 2) {
    throw new UserError("Category rule name must be at least 2 chars");
  }

  if (!data.rule || data.rule.length < 2) {
    throw new UserError("Category rule must be at least 2 chars");
  }

  const rule = await prisma.categoryRule.create({
    data: {
      userId: category.userId,
      categoryId: category.id,
      name: data.name,
      transactionType: data.transactionType || null,
      rule: data.rule,
    },
  });

  return toApiResponse<CategoryRule>(rule, {
    intKeys: ["id", "userId", "categoryId"],
    dateKeys: ["createdAt"],
  });
}

export async function updateCategoryRule(
  categoryId: number,
  id: number,
  data: CategoryRuleFormState
) {
  if (!data.name || data.name.length < 2) {
    throw new UserError("Category rule name must be at least 2 chars");
  }

  if (!data.rule || data.rule.length < 2) {
    throw new UserError("Category rule must be at least 2 chars");
  }

  const rule = await prisma.categoryRule.update({
    where: {
      id,
      categoryId,
    },
    data: {
      name: data.name,
      transactionType: data.transactionType || null,
      rule: data.rule,
    },
  });

  return toApiResponse<CategoryRule>(rule, {
    intKeys: ["id", "userId", "categoryId"],
    dateKeys: ["createdAt"],
  });
}

export async function deleteCategoryRule(categoryId: number, id: number) {
  await prisma.categoryRule.delete({
    where: {
      id,
      categoryId,
    },
  });
}

export async function getCategoryRules(categoryId: number) {
  return (
    await prisma.categoryRule.findMany({
      where: { categoryId },
    })
  ).map((r) =>
    toApiResponse<CategoryRule>(r, {
      intKeys: ["id", "categoryId", "userId"],
      dateKeys: ["createdAt"],
    })
  );
}

export async function moveTransactionToCategory(
  category: Category,
  transactionId: number
) {
  await prisma.categoryTransactions.updateMany({
    where: {
      transactionId,
      categoryId: {
        not: category.id,
      },
    },
    data: {
      ignoredAt: new Date(),
    },
  });

  await prisma.categoryTransactions.upsert({
    where: {
      category_transaction: {
        categoryId: category.id,
        transactionId,
      },
    },
    update: {
      ignoredAt: null,
      setAt: new Date(),
    },
    create: {
      categoryId: category.id,
      transactionId,
      ignoredAt: null,
      setAt: new Date(),
    },
  });
}
