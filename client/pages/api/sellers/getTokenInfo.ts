import { NextApiRequest, NextApiResponse } from "next";
import { getTokenDetails } from "../../../lib/ethers";

// /api/getTokenInfo?tokenContractAddr=XXXXXXXXXXXXX
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("tokenContractAddr" in query)) {
        res.status(400).send("Query must contain `tokenContractAddr`!");
        return;
    }

    try {
        const tokenDetails = await getTokenDetails(query.tokenContractAddr as string);
        res.status(200).json(tokenDetails);
    } catch (e: any) {
        res
            .status(500)
            .send(e?.message || "Request could not be processed!");
    }
}