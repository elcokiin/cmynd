import { authClient } from "@/lib/auth-client";
import { ArrowRight } from "lucide-react";
import { Atmosphere } from "@elcokiin/ui/atmosphere";
import LogoStudio from "@/assets/images/logo.png";

export function SignInForm(): React.ReactNode {
  return (
    <Atmosphere
      transparent={true}
      withGrid={true}
      className="flex flex-1 w-full relative selection:bg-primary/30 selection:text-foreground"
    >
      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-3 z-20">
        <img
          src={LogoStudio}
          alt="elcokiin logo"
          width={32}
          height={32}
          className="rounded-full object-cover shadow-sm shadow-primary/20"
        />
        <span className="font-bold text-sm tracking-tight text-foreground">
          ELCOKIIN-STUDIO.
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[800px] flex-col items-center justify-center px-4 text-center h-full min-h-screen">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Share your voice. <br className="hidden sm:block" />
          Inspire the community.
        </h1>
        <p className="mb-10 max-w-[500px] text-base text-muted-foreground sm:text-lg">
          Write, publish, and share your ideas with nerds
        </p>

        <div className="w-full max-w-sm space-y-6 relative z-10">
          <button
            className="group relative flex h-14 w-full items-center justify-between rounded-md bg-card border border-border px-5 text-base font-medium text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98] shadow-lg shadow-primary/10 cursor-pointer"
            onClick={async () => {
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              });
            }}
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </button>

          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground mt-4 relative z-10">
            <p>
              Or visit the blog you'll be collaborating on:{" "}
              <a
                href="https://blog.elcokiin.my/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-medium"
              >
                blog.elcokiin.my
              </a>
            </p>
          </div>
        </div>
      </div>
    </Atmosphere>
  );
}
