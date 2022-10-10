import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { Event } from "./events";
import { userRouter } from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";
import AppUOW from "./repositories";
import "./seed";
import "colors";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on(Event.CONNECT, (socket: Socket) => {
  const appUOW = new AppUOW(socket);

  socket.on(Event.ACCEPT_FRIEND, async (data: { id: number }) => {
    await appUOW.friendRepo.handleAcceptFriendEvent(data.id);
  });

  socket.on(Event.NOTIFICATION, async () => {
    await appUOW.notificationRepo.handleNotificationsEvent();
  });
});

app.use(express.json());
app.use("/api/v1", userRouter);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.green.underline.bold)
);
