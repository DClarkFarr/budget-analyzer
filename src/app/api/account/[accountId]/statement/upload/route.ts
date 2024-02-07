import importProcessedTransactions from "@/server/actions/transactionActions";
import { FileUploader } from "@/server/classes/FileUploader";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { StatementType } from "@/types/Statement";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Upload a statement csv file
 */
export const POST = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req, { params }: { params: { accountId: string } }) => {
    const userId = req.session.user.id;
    const accountId = parseInt(params.accountId);
    const fd = await req.formData();
    const file = fd.get("file");
    const type = fd.get("type");

    const uploader = new FileUploader(type as StatementType, file as File);

    const transactions = await uploader.getTransactions();

    const { created, skipped } = await importProcessedTransactions(
      userId,
      accountId,
      transactions
    );

    return NextResponse.json({
      message: "Upload successful",
      created,
      skipped,
    });
  }
);
