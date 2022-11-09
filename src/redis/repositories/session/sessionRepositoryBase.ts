/* istanbul ignore file */
import { SessionEntity, sessionSchema } from "../../../models/session.js";
import client from "../../Client.js";

const ttlInSeconds = 600;

export const sessionRepository = client.fetchRepository(sessionSchema);

export const fetch = (id: string) => {
  return sessionRepository.fetch(id);
};

export const expire = (id: string) => {
  return sessionRepository.expire(id, ttlInSeconds);
};

export const save = (sessionEntity: SessionEntity) => {
  return sessionRepository.save(sessionEntity);
};

export const remove = (id: string) => {
  return sessionRepository.remove(id);
};
