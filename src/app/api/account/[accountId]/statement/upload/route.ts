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

    const uploader = new FileUploader(
      accountId,
      type as StatementType,
      file as File
    );

    try {
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
    } catch (err) {
      console.warn("Error uploading statement", err);
      return NextResponse.json(
        {
          message: "Error uploading statement",
          error: (err as Error)?.message,
        },
        { status: 400 }
      );
    }
  }
);
