import app from "./app";

const start = async () => {
  try {
    await app.listen({
      port: parseInt(process.env.PORT ?? "") || 3000,
      host: "0.0.0.0",
    });
    app.log.info(`Server is running on http://localhost:${process.env.PORT}`);
    app.log.info(
      `API documentation available at http://localhost:${process.env.PORT}/documentation`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
