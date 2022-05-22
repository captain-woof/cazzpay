import { NextApiRequest, NextApiResponse } from "next";
import { totalTransactionsUnderSeller } from "../../../lib/graphql";

// /api/getTotalTransactionsNum?id=ABCD
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("id" in query)) {
        res.status(400).send("Query must contain `id`!");
        return;
    }

    try {
        const totalNumberOfTransactions = await totalTransactionsUnderSeller(query.id as string);
        res.status(200).send(totalNumberOfTransactions);
    } catch (e: any) {
        res
            .status(500)
            .send(e?.message || "Request could not be processed!")
    }
}