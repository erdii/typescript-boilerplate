import { createLogger } from "./lib/logger";

const logger = createLogger("DEBUG");

logger.info("Hello world!?!", {
	here: "there",
	hui: "booooo",
	that: "this223",
	zoink: "multipass!?",
	env: process.env.NODE_ENV,
	apiKey: process.env.WEBAPP_ENV_API_KEY,
});
