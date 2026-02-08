import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  strategies,
  subscriptions,
  payments,
} from "./schema";

// Select types (for reading from database)
export type User = InferSelectModel<typeof users>;
export type Strategy = InferSelectModel<typeof strategies>;
export type Subscription = InferSelectModel<typeof subscriptions>;
export type Payment = InferSelectModel<typeof payments>;

// Insert types (for inserting into database)
export type NewUser = InferInsertModel<typeof users>;
export type NewStrategy = InferInsertModel<typeof strategies>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
export type NewPayment = InferInsertModel<typeof payments>;
