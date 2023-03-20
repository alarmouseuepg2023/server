import { env } from "@helpers/env";
import { app } from "@http/app";

import "@mqtt/index";

const port = env("PORT");
if (!port) throw new Error("No PORT configurated");

app.listen(port, () => console.log(`Server started at ${port}`));
