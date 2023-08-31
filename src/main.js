import { logger } from "./application/logging.js";
import { web } from "./application/web.js";

web.listen(process.env.PORT || 3000, ()=> {
    logger.info("App start");
});



