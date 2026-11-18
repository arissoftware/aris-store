import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = createApp();

server.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});
