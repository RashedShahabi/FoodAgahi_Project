import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const admins = [
  {username:"maedekhalili",password:"123456789"},
  {username:"soheiladelbakhsh",password:"123456789"},
  {username:"rashedshahabi",password:"123456789"},
  {username:"denizahmadi",password:"123456789"},
];

export function middleware(req:NextRequest){

  if(!req.nextUrl.pathname.startsWith("/admin")){
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if(!auth){
    return new NextResponse("Authentication required",{
      status:401,
      headers:{
        "WWW-Authenticate":"Basic"
      }
    });
  }

  const encoded = auth.split(" ")[1];
  const decoded = atob(encoded);
  const [username,password] = decoded.split(":");

  const valid = admins.find(
    a=>a.username===username && a.password===password
  );

  if(!valid){
    return new NextResponse("Access denied",{status:403});
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
