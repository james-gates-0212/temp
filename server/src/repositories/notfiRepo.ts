import { Op } from "sequelize";
import { Notification, NotificationType } from "../models/Notification";
import AppUOW from ".";
import { Event } from "../events";
import BaseRepo from "./baseRepo";
import { IUser } from "../models/User";

export type INotification = {
  content: string;
  type: NotificationType;
  user: number | IUser;
  isSeen: boolean;
};

export default class NotificationRepo extends BaseRepo {
  constructor(app: AppUOW) {
    super(app);
    this.initListeners();
  }

  initListeners() {
    const { socket } = this.app;
    socket.on(Event.Notification, async () => {
      this.handleNotificationsEvent();
    });
  }

  async pushNotification(n: {
    content: {
      userId: number;
    };
    type: NotificationType;
    userId: number;
  }) {
    // Check if notification exist
    await Notification.create({
      ...n,
      isSeen: false,
    });
  }

  async isFriendshipRequestAlreadySent(sender: number, receiver: number) {
    let notif = await Notification.findOne({
      where: {
        "content.userId": {
          [Op.eq]: sender,
        },
        UserId: receiver,
      },
    });

    return notif?.get();
  }

  async getNotifications(userId: number): Promise<INotification[]> {
    let all = await Notification.findAll({
      where: {
        UserId: userId,
      },
    });

    return all.map((n) => n.get());
  }

  async handleNotificationsEvent() {
    const { socket } = this.app;
    await this.errorHandler(async () => {
      const userId = this.app.decodeAuthToken();
      const user = await this.app.userRepo.getUserById(userId);
      if (!user) throw new Error("User not foudn");
      let notifications = this.getNotifications(user.id);

      socket.emit(Event.Notification, notifications);
    }, Event.Notification);
  }
}
