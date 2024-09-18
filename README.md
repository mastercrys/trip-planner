# Trip Planner API

This project implements a Trip Planner API using Node.js 18+, Fastify, TypeScript, and MongoDB.

## Features

- Search for trips with sorting options (fastest/cheapest)
- Save, list, and delete trips
- Pagination for trip listing
- Trip statistics (total trips, average cost, average duration, popular destinations)
- API documentation with Swagger
- Rate limiting
- Error handling and input validation
- Unit tests with Jest and MongoDB Memory Server

## Prerequisites

- Node.js (v18 or later)
- Docker
- MongoDB

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/mastercrys/trip-planner.git
   cd trip-planner
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```
   PORT=3000
   API_KEY=your_3rd_party_api_key
   MONGODB_URI=mongodb://localhost:27017/trip-planner
   ```

4. Create a `.env.test` file in the root directory for testing:

   ```
   API_KEY=your_test_api_key
   MONGODB_URI=mongodb://localhost:27017/trip-planner-test
   ```

5. Start MongoDB using Docker:

   ```
   docker run -d -p 27017:27017 --name trip-planner-mongo mongo:latest
   ```

   Or use docker compose

   ```
   docker-compose up
   ```

## Building the Project

To build the TypeScript code, run:

```
npm run build
```

This will compile the TypeScript files and output the JavaScript files in the `dist` directory.

## Running the Project

To start the server in development mode with hot reloading:

```
npm run dev
```

To start the server in production mode:

```
npm start
```

The server will be running on `http://localhost:3000`.

## Testing

To run the tests:

```
npm test
```

This will run the Jest test suite, which includes unit tests for the trip controller using an in-memory MongoDB server.

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:3000/documentation
```

## API Endpoints

1. Search for trips:

   ```
   GET /search?origin=SYD&destination=GRU&sort_by=fastest
   ```

2. Save a trip:

   ```
   POST /trips
   ```

3. List all saved trips (with pagination):

   ```
   GET /trips?page=1&limit=10
   ```

4. Delete a trip:

   ```
   DELETE /trips/:id
   ```

5. Get trip statistics:
   ```
   GET /trips/stats
   ```

## Error Handling

The API includes comprehensive error handling, including:

- Input validation errors
- Database operation errors
- Third-party API errors

All errors are logged and return appropriate HTTP status codes and error messages.

## Rate Limiting

The API includes rate limiting to prevent abuse. By default, it's set to 100 requests per minute per IP address.

## Linting

To run the linter:

```
npm run lint
```

This will run ESLint on all TypeScript files in the project.

## Compromises and Future Improvements

1. The project uses an in-memory MongoDB for testing. For more comprehensive integration tests, consider setting up a separate test database.
2. The rate limiting is basic and could be improved with more sophisticated strategies or integration with a caching layer like Redis.
3. Authentication and authorization could be implemented for secure access to the API.
4. The project could benefit from integration with a CI/CD pipeline for automated testing and deployment.
5. Consider adding more detailed logging and monitoring for production use.
6. The trip statistics could be expanded to include more insights, such as busiest travel times or most profitable routes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
