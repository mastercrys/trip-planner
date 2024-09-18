import Fastify, { FastifyInstance } from "fastify";
import { config } from "dotenv";
import mongoose from "mongoose";
import tripRoutes from "./routes/tripRoutes";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import ajvErrors from "ajv-errors";

config();

const app: FastifyInstance = Fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },
  ajv: {
    customOptions: {
      allErrors: true, // This enables AJV to show all validation errors at once
      strict: false, // Disable strict mode to allow 'errorMessage'
    },
    plugins: [ajvErrors], // Use ajv-errors plugin
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/trip-planner")
  .then(() => app.log.info("Connected to MongoDB"))
  .catch((err) => app.log.error("Error connecting to MongoDB:", err));

// Register rate limiting
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Register Swagger
app.register(fastifySwagger, {
  swagger: {
    info: {
      title: "Trip Planner API",
      description: "API for planning trips",
      version: "1.0.0",
    },
  },
});
app.register(fastifySwaggerUi, {
  routePrefix: "/documentation",
});

// Register routes
app.register(tripRoutes);

export default app;
