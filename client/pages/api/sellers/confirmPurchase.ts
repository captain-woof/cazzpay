import { NextApiRequest, NextApiResponse } from "next";
import { setPurchaseConfirmation } from "../../../lib/ethers";


// /api/confirmPurchase?cazzPayTransactionId=12
export async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("cazzPayTransactionId" in query)) {
        res.statusCode = 400;
        res.statusMessage = "Query must contain `cazzPayTransactionId`!";
        res.end();
        return;
    }

    try {
        await setPurchaseConfirmation(query.cazzPayTransactionId as string);
        res.statusCode = 200;
        res.statusMessage = "Transaction confirmed!";
    } catch (e: any) {
        res.statusCode = 500;
        res.statusMessage = e?.message || "Request could not be processed!";
    } finally {
        res.end();
    }
}