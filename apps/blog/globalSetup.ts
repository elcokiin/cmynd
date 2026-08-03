import http from "node:http";

const BASE_URL = "http://localhost:4321";
const MAX_WAIT_MS = 60_000;
const INITIAL_DELAY_MS = 500;
const MAX_DELAY_MS = 3_000;

async function waitForServer(): Promise<void> {
  const start = Date.now();
  let delay = INITIAL_DELAY_MS;

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const html = await new Promise<string>((resolve, reject) => {
        http
          .get(BASE_URL, (res) => {
            if (res.statusCode !== 200) {
              res.resume();
              reject(new Error(`Status ${res.statusCode}`));
              return;
            }
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
          })
          .on("error", reject);
      });

      if (html.includes('id="mobile-drawer"')) {
        return;
      }
    } catch {
      // server not ready yet
    }

    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, MAX_DELAY_MS);
  }

  throw new Error(
    `Astro dev server at ${BASE_URL} did not become ready within ${MAX_WAIT_MS}ms`,
  );
}

export default async function globalSetup() {
  await waitForServer();
}
