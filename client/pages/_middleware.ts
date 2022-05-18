import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  //some function to get the current token
  // const token = "";
  // const url = req.nextUrl.clone();
  // const { pathname } = req.nextUrl;
  // //this should be the path from where we can login
  // url.pathname = "/";
  // /** 1. if the url pathname is related to login page - pass through
  //  *  2. if the user is authenticated with correct token - pass through
  //  * */
  // const loginUrl: string = "/";
  // if (pathname.includes(loginUrl) || token) {
  //   return NextResponse.next();
  // }
  // /** If the user is not authenticated we are redirecting to the loginUrl*/
  // if (!token) {
  //   return NextResponse.redirect(url);
  // }
}
