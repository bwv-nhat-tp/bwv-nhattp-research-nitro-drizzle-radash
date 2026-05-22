import { AuthService } from "./auth";
import { TransferService } from "./transfer";
import { UserService } from "./user";

export const authService = new AuthService();
export const transferService = new TransferService();
export const userService = new UserService();

export * from "./auth";
export * from "./transfer";
export * from "./types";
export * from "./user";
