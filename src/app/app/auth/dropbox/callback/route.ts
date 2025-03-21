import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

// Handle the OAuth callback from Dropbox
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle errors from Dropbox
  if (error) {
    console.error("Dropbox auth error:", error);
    return NextResponse.redirect(
      new URL(`/app/documents?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    console.error("Missing required parameters");
    return NextResponse.redirect(
      new URL("/app/documents?error=missing_params", request.url)
    );
  }

  try {
    // Verify the user is authenticated
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return NextResponse.redirect(
        new URL("/auth/login?error=auth_required", request.url)
      );
    }

    // Redirect to the documents page with the code and state as query parameters
    // The client-side code will handle the token exchange
    return NextResponse.redirect(
      new URL(
        `/app/documents?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error in Dropbox callback:", error);
    return NextResponse.redirect(
      new URL("/app/documents?error=server_error", request.url)
    );
  }
}
