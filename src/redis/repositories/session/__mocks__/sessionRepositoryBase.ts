/* istanbul ignore file */
import { SessionEntity, sessionSchema } from "../../../../models/session.js";

export const sessionTTLInSeconds = 600;

let sessionRepository: Map<string, SessionEntity>;

export const initSessionRepository = () => {
  sessionRepository = new Map<string, SessionEntity>();
  sessionRepository.set(
    "exampleSessionID",
    new SessionEntity(sessionSchema, "exampleSessionID", {
      email: "jane.doe@example.com",
    })
  );
};
export const fetch = (id: string) => {
  return sessionRepository.get(id);
};

export const refresh = (id: string) => {
  setTimeout(() => {
    remove(id);
  }, 1000 * sessionTTLInSeconds);
};

export const save = (sessionEntity: SessionEntity) => {
  sessionRepository.set(sessionEntity.entityId, sessionEntity);
  return sessionEntity.entityId;
};

export const remove = (id: string) => {
  return sessionRepository.delete(id);
};
