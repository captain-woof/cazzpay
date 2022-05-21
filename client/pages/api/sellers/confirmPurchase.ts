import { NextApiRequest, NextApiResponse } from "next";
import { setPurchaseConfirmation } from "../../../lib/ethers";


// /api/confirmPurchase?cazzPayTransactionId=12
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("cazzPayTransactionId" in query)) {
        res.status(400).send("Query must contain `cazzPayTransactionId`!");
        return;
    }

    try {
        await setPurchaseConfirmation(query.cazzPayTransactionId as string);
        res.status(200).send("Transaction confirmed!");
    } catch (e: any) {
        res.status(500).send(e?.message || "Request could not be processed!");
    }
}