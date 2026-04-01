import { Hono } from "hono";
import {
  configureExpoUp,
  createExpoUpServer,
  ExpoUpGithubStorageProvider,
  type ExpoUpContextVariables,
} from "@expo-up/server";

type Bindings = {
  GITHUB_AUTH_TOKEN: string;
  CODESIGNING_APP_PRIVATE_KEY?: string;
  CODESIGNING_APP_KEY_ID?: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
};

const EXPO_UP_BASE_PATH = "/api/ota";

const EXPO_UP_PROJECTS = {
  clawdi: {
    owner: "glncy",
    repo: "clawdi-ota",
  },
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: ExpoUpContextVariables;
}>();

app.use(`${EXPO_UP_BASE_PATH}/*`, async (c, next) => {
  configureExpoUp(c, {
    storage: new ExpoUpGithubStorageProvider(c.env.GITHUB_AUTH_TOKEN),
    github: {
      clientId: c.env.GITHUB_CLIENT_ID,
      clientSecret: c.env.GITHUB_CLIENT_SECRET,
    },
    certificate:
      c.env.CODESIGNING_APP_PRIVATE_KEY && c.env.CODESIGNING_APP_KEY_ID
        ? {
            privateKey: c.env.CODESIGNING_APP_PRIVATE_KEY,
            keyId: c.env.CODESIGNING_APP_KEY_ID,
          }
        : undefined,
  });

  await next();
});

app.route(
  EXPO_UP_BASE_PATH,
  createExpoUpServer({
    basePath: EXPO_UP_BASE_PATH,
    projects: EXPO_UP_PROJECTS,
  }),
);

app.get("/health-check", (c) => {
  const missing: string[] = [];
  if (!c.env.GITHUB_AUTH_TOKEN) missing.push("GITHUB_AUTH_TOKEN");
  if (!c.env.GITHUB_CLIENT_ID) missing.push("GITHUB_CLIENT_ID");
  if (!c.env.GITHUB_CLIENT_SECRET) missing.push("GITHUB_CLIENT_SECRET");

  if (missing.length > 0) {
    return c.json(
      {
        status: "error",
        message: "Missing required environment variables",
        missing,
      },
      500,
    );
  }

  const codeSigningEnabled = !!(
    c.env.CODESIGNING_APP_PRIVATE_KEY && c.env.CODESIGNING_APP_KEY_ID
  );

  return c.json({
    status: "ok",
    message: "Updates worker is running",
    codeSigningEnabled,
  });
});

export default app;
