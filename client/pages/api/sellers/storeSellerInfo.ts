import { NextApiRequest, NextApiResponse } from "next";
import { storeSellerInfo } from "../../../lib/ethers";


// /api/storeSellerInfo?name=AAAA&email=aa@email.com&id=ABCD
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("name" in query && "email" in query && "id" in query)) {
        res.statusCode = 400;
        res.statusMessage = "Query must contain `id`, `email` and `name`!";
        res.end();
        return;
    }

    try {
        await storeSellerInfo(query.id as string, query.email as string, query.name as string);
        res.status(200).send("Seller details stored/updated");
    } catch (e: any) {
        res
            .status(e?.message === "Seller already exists with same info!" ? 200 : 500)
            .send(e?.message || "Request could not be processed!");
    }
}