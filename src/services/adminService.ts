
import { animalService } from "./animalService";
import { eventService } from "./eventService";
import { notificationService } from "./notificationService";
import { systemService } from "./systemService";

export * from "@/types/admin";

export const adminService = {
  ...animalService,
  ...eventService,
  ...notificationService,
  ...systemService
};

export default adminService;
