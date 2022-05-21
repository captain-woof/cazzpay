import { NextApiRequest, NextApiResponse } from "next";
import { capturePayment } from "../../../lib/paypal";

export default async function CaptureOrderRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const orderId: string = req.query.orderId as string;
    const captureData = await capturePayment(orderId);
    res.status(200).json(captureData);
  } else {
    res.status(501).send("Only post method is allowed");
  }
}
