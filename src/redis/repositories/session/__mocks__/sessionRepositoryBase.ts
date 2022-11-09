/* istanbul ignore file */
import { SessionEntity } from "../../../../models/session.js";

const ttlInSeconds = 600;

let sessionRepository: Map<string, SessionEntity> = new Map<
  string,
  SessionEntity
>();

export const fetch = (id: string) => {
  return sessionRepository.get(id);
};

export const expire = (id: string) => {
  setTimeout(() => {
    remove(id);
  }, 1000 * ttlInSeconds);
};

export const save = (sessionEntity: SessionEntity) => {
  sessionRepository.set(sessionEntity.entityId, sessionEntity);
  return sessionEntity.entityId;
};

export const remove = (id: string) => {
  return sessionRepository.delete(id);
};
