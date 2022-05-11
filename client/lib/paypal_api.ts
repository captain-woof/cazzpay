const CLIENT_ID: string = process.env.PAYPAL_CLIENT_ID as string;
const CLIENT_SECRET: string = process.env.PAYPAL_CLIENT_SECRET as string;
const base = "https://api-m.sandbox.paypal.com";

//library function for creating an order
export async function createOrder(): Promise<string> {
  const accessToken: string = await generateAccessToken();
  const url: string = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100.00",
          },
        },
      ],
    }),
  });

  const data = await response.json();
  return data;
}
//library function to capture the payment of the order based on orderId
export async function capturePayment(orderId: string) {
  const access_token: string = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const data = await response.json();
  return data;
}

//incase of any error happens while minting the token or the token could not generated
//we have to refund the payment
export async function refundPayment(paymentId: string) {}
//helper function for generating access token via paypal client id and secret
export async function generateAccessToken(): Promise<string> {
  const auth = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}
