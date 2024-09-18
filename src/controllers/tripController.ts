import { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import Trip, { ITrip } from "../models/Trip";

const API_URL =
  "https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips";
const API_KEY = process.env.API_KEY;

export async function searchTrips(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { origin, destination, sort_by } = request.query as {
    origin: string;
    destination: string;
    sort_by: "fastest" | "cheapest";
  };

  try {
    const response = await axios.get(API_URL, {
      headers: { "x-api-key": API_KEY },
      params: { origin, destination },
    });

    let trips = response.data;

    if (sort_by === "fastest") {
      trips.sort((a: ITrip, b: ITrip) => a.duration - b.duration);
    } else if (sort_by === "cheapest") {
      trips.sort((a: ITrip, b: ITrip) => a.cost - b.cost);
    }

    reply.send(trips);
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: "Error fetching trips" });
  }
}

export async function saveTrip(request: FastifyRequest, reply: FastifyReply) {
  const tripData = request.body as ITrip;

  try {
    const trip = new Trip(tripData);
    await trip.save();
    reply.status(201).send(trip);
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: "Error saving trip" });
  }
}

export async function listTrips(request: FastifyRequest, reply: FastifyReply) {
  const { page = 1, limit = 10 } = request.query as {
    page?: number;
    limit?: number;
  };

  try {
    const trips = await Trip.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Trip.countDocuments();

    reply.send({
      trips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: "Error fetching trips" });
  }
}

export async function deleteTrip(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  try {
    const result = await Trip.findByIdAndDelete(id);
    if (result) {
      reply.send({ message: "Trip deleted successfully" });
    } else {
      reply.status(404).send({ error: "Trip not found" });
    }
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: "Error deleting trip" });
  }
}

export async function getTripStats(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const totalTrips = await Trip.countDocuments();
    const avgCost = await Trip.aggregate([
      { $group: { _id: null, avg: { $avg: "$cost" } } },
    ]);
    const avgDuration = await Trip.aggregate([
      { $group: { _id: null, avg: { $avg: "$duration" } } },
    ]);
    const popularDestinations = await Trip.aggregate([
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    reply.send({
      totalTrips,
      avgCost: avgCost[0]?.avg || 0,
      avgDuration: avgDuration[0]?.avg || 0,
      popularDestinations,
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: "Error fetching trip statistics" });
  }
}
