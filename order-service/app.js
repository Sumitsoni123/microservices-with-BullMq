import express from "express";
import { Queue, QueueEvents } from "bullmq";

const app = express();
const PORT = 8000;

app.use(express.json());

const verifyUser = new Queue("user-verification-queue");
const verificationQueueEvent = new QueueEvents("user-verification-queue");

const checkUserVerification = (jobId) => {
  return new Promise((resolve, reject) => {
    verificationQueueEvent.on(
      "completed",
      ({ jobId: completedJobId, returnvalue }) => {
        if (jobId === completedJobId) {
          const { isValidUser, rest } = returnvalue;
          resolve({ isValidUser, rest });
        }
      }
    );

    verificationQueueEvent.on(
      "failed",
      ({ jobId: failedJobId, failedReason }) => {
        if (jobId === failedJobId) {
          reject(new Error(failedReason));
        }
      }
    );
  });
};

app.post("/order", async (req, res) => {
  try {
    const { orderId, productName, productPrice, userId } = req.body;
    const job = await verifyUser.add("Verify User", { userId });
    const { isValidUser, rest } = await checkUserVerification(job.id);

    if (!isValidUser) {
      return res.send({
        message: "User is not valid",
      });
    }

    return res.send({
      message: "User is valid",
      rest,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Order Server started at ${PORT}`);
});
