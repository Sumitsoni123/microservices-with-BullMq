import express from "express";
import { Worker } from "bullmq";

const app = express();
const PORT = 8001;

app.use(express.json());

const userDB = [
  {
    id: 1,
    name: "Sumit",
    email: "sumitsoni3152gmail.com",
    password: "abcd",
  },
];

const verificationWorker = new Worker(
  "user-verification-queue",
  (job) => {
    const { userId } = job.data;
    console.log("job received wih userID: ", userId);

    const isValidUser = userDB.some((item) => item.id === userId);
    console.log(`User valid ${isValidUser}`);

    const { password, ...rest } = userDB[0];

    return { isValidUser, rest };
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

app.listen(PORT, () => {
  console.log(`Order Server started at ${PORT}`);
});
