import { NextApiRequest, NextApiResponse } from "next";
import { createOrder } from "../../../lib/paypal_api";

export default async function CreateOrderRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const order = await createOrder();
    res.status(200).json(order);
  } else {
    res.status(501).send("only post method allowed");
  }
}
