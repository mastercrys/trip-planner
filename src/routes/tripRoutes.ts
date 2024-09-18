import { FastifyInstance } from "fastify";
import {
  searchTrips,
  saveTrip,
  listTrips,
  deleteTrip,
  getTripStats,
} from "../controllers/tripController";
import {
  searchSchema,
  saveTripSchema,
  listTripsSchema,
  deleteTripSchema,
  getTripStatsSchema,
} from "../schemas/tripSchemas";

export default async function (fastify: FastifyInstance) {
  fastify.get("/search", { schema: searchSchema }, searchTrips);
  fastify.post("/trips", { schema: saveTripSchema }, saveTrip);
  fastify.get("/trips", { schema: listTripsSchema }, listTrips);
  fastify.delete("/trips/:id", { schema: deleteTripSchema }, deleteTrip);
  fastify.get("/trips/stats", { schema: getTripStatsSchema }, getTripStats);
}
