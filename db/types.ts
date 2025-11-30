import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  stocks,
  strategies,
  fundamentals,
  indicators,
  subscriptions,
  notifications,
  trades,
  notificationStocks,
} from "./schema";

// Select types (for reading from database)
export type Stock = InferSelectModel<typeof stocks>;
export type Strategy = InferSelectModel<typeof strategies>;
export type Fundamental = InferSelectModel<typeof fundamentals>;
export type Indicator = InferSelectModel<typeof indicators>;
export type Subscription = InferSelectModel<typeof subscriptions>;
export type Notification = InferSelectModel<typeof notifications>;
export type Trade = InferSelectModel<typeof trades>;
export type NotificationStock = InferSelectModel<typeof notificationStocks>;

// Insert types (for inserting into database)
export type NewStock = InferInsertModel<typeof stocks>;
export type NewStrategy = InferInsertModel<typeof strategies>;
export type NewFundamental = InferInsertModel<typeof fundamentals>;
export type NewIndicator = InferInsertModel<typeof indicators>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type NewTrade = InferInsertModel<typeof trades>;
export type NewNotificationStock = InferInsertModel<typeof notificationStocks>;

