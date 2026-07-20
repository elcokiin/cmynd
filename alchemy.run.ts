import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

const studioOrigins = (process.env.STUDIO_ORIGINS || "http://localhost:3001")
  .split(",")
  .map((s) => s.trim());

export default Alchemy.Stack(
  "Cmynd",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.Bucket("Images", {
      cors: [
        {
          allowedOrigins: studioOrigins,
          allowedMethods: ["GET", "PUT"],
          allowedHeaders: ["*"],
          maxAgeSeconds: 3600,
        },
      ],
    });

    return {
      bucketName: bucket.bucketName,
    };
  }),
);
