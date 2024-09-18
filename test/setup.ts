import { config } from "dotenv";
import { jest } from "@jest/globals";

config({ path: ".env.test" });

jest.setTimeout(30000);
