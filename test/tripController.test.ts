import { FastifyInstance } from "fastify";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app";
import Trip from "../src/models/Trip";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import axios from "axios";

let server: FastifyInstance;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Close any existing connections
  await mongoose.disconnect();

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  server = app;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Trip.deleteMany({});
});

describe("Trip Controller", () => {
  it("should search trips with sorting", async () => {
    // Mock the axios.get function to return sample data
    jest.spyOn(axios, "get").mockResolvedValueOnce({
      data: [
        { origin: "SYD", destination: "LAX", cost: 1000, duration: 14 },
        { origin: "SYD", destination: "LAX", cost: 800, duration: 15 },
        { origin: "SYD", destination: "LAX", cost: 1200, duration: 13 },
      ],
    });

    const response = await server.inject({
      method: "GET",
      url: "/search?origin=SYD&destination=LAX&sort_by=cheapest",
    });

    expect(response.statusCode).toBe(200);
    const trips = JSON.parse(response.payload);
    expect(trips).toHaveLength(3);
    expect(trips[0].cost).toBe(800); // Cheapest trip should be first
  });

  it("should return 400 for invalid IATA code", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/search?origin=SYD&destination=ZZZ&sort_by=fastest",
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "querystring/destination Origin must be one of the valid codes.",
    });
  });

  it("should save a trip", async () => {
    const tripData = {
      origin: "SYD",
      destination: "LAX",
      cost: 1000,
      duration: 14,
      type: "flight",
      id: "123",
      display_name: "Sydney to Los Angeles",
    };

    const response = await server.inject({
      method: "POST",
      url: "/trips",
      payload: tripData,
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.payload)).toMatchObject(tripData);
  });

  it("should list trips", async () => {
    await Trip.create({
      origin: "SYD",
      destination: "LAX",
      cost: 1000,
      duration: 14,
      type: "flight",
      id: "123",
      display_name: "Sydney to Los Angeles",
    });

    const response = await server.inject({
      method: "GET",
      url: "/trips",
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.trips).toHaveLength(1);
    expect(payload.totalPages).toBe(1);
    expect(payload.currentPage).toBe(1);
  });

  it("should delete a trip", async () => {
    const trip = await Trip.create({
      origin: "SYD",
      destination: "LAX",
      cost: 1000,
      duration: 14,
      type: "flight",
      id: "123",
      display_name: "Sydney to Los Angeles",
    });

    const response = await server.inject({
      method: "DELETE",
      url: `/trips/${trip._id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      message: "Trip deleted successfully",
    });

    const deletedTrip = await Trip.findById(trip._id);
    expect(deletedTrip).toBeNull();
  });

  it("should return 404 when deleting non-existent trip", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await server.inject({
      method: "DELETE",
      url: `/trips/${nonExistentId}`,
    });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload)).toEqual({ error: "Trip not found" });
  });

  it("should get trip statistics", async () => {
    await Trip.create([
      {
        origin: "SYD",
        destination: "LAX",
        cost: 1000,
        duration: 14,
        type: "flight",
        id: "123",
        display_name: "Sydney to Los Angeles",
      },
      {
        origin: "NYC",
        destination: "LON",
        cost: 800,
        duration: 7,
        type: "flight",
        id: "124",
        display_name: "New York to London",
      },
      {
        origin: "TYO",
        destination: "PAR",
        cost: 1200,
        duration: 12,
        type: "flight",
        id: "125",
        display_name: "Tokyo to Paris",
      },
      {
        origin: "SYD",
        destination: "LAX",
        cost: 1100,
        duration: 15,
        type: "flight",
        id: "126",
        display_name: "Sydney to Los Angeles",
      },
    ]);

    const response = await server.inject({
      method: "GET",
      url: "/trips/stats",
    });

    expect(response.statusCode).toBe(200);
    const stats = JSON.parse(response.payload);
    expect(stats.totalTrips).toBe(4);
    expect(stats.avgCost).toBeCloseTo(1025, 2);
    expect(stats.avgDuration).toBeCloseTo(12, 2);
    expect(stats.popularDestinations).toHaveLength(3);
    expect(stats.popularDestinations[0]).toMatchObject({
      _id: "LAX",
      count: 2,
    });
  });

  it("should handle errors when searching trips", async () => {
    // Mock the axios.get function to throw an error
    jest.spyOn(axios, "get").mockRejectedValueOnce(new Error("API Error"));

    const response = await server.inject({
      method: "GET",
      url: "/search?origin=SYD&destination=LAX&sort_by=fastest",
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.payload)).toEqual({
      error: "Error fetching trips",
    });
  });

  it("should handle validation errors", async () => {
    const invalidTripData = {
      origin: "SYDNEY", // Invalid: should be 3 letters
      destination: "LAX",
      cost: -100, // Invalid: should be non-negative
      duration: 14,
      type: "flight",
      id: "123",
      display_name: "Sydney to Los Angeles",
    };

    const response = await server.inject({
      method: "POST",
      url: "/trips",
      payload: invalidTripData,
    });

    expect(response.statusCode).toBe(400);
    const error = JSON.parse(response.payload);
    expect(error.message).toContain("body/origin");
    expect(error.message).toContain("body/cost");
  });

  it("should paginate trip list results", async () => {
    // Create 25 trips
    const trips = Array.from({ length: 25 }, (_, i) => ({
      origin: "SYD",
      destination: "LAX",
      cost: 1000 + i,
      duration: 14,
      type: "flight",
      id: `12${i}`,
      display_name: `Sydney to Los Angeles ${i + 1}`,
    }));
    await Trip.create(trips);

    const response = await server.inject({
      method: "GET",
      url: "/trips?page=2&limit=10",
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.trips).toHaveLength(10);
    expect(payload.totalPages).toBe(3);
    expect(payload.currentPage).toBe(2);
  });
});
