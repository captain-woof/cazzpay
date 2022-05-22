type PaypalProfile = {
  name: string;
  email: string;
  paypalId: string;
};

type PayPalToken = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};
