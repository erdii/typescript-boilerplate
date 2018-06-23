import { createLogger } from "./lib/logger";

const logger = createLogger("DEBUG");

logger.info("Hello world!?!", {
	here: "there",
	hui: "booooo",
	that: "this223",
	zoink: "multipass!?",
});
