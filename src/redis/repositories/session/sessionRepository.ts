import APIError from "../../../apiError.js";
import {
  Session,
  SessionEntity,
  sessionSchema,
} from "../../../models/session.js";
import {
  expire as renew,
  fetch,
  remove,
  save,
} from "./sessionRepositoryBase.js";
import chalk from "chalk";

export const createSession = async (session: Session): Promise<boolean> => {
  const existingSession = await fetch(session.sessionID);
  if (existingSession && existingSession.email) {
    console.warn(
      chalk.yellowBright(
        `Skipping session ${existingSession.entityId} – existing already.`
      )
    );
    return false;
  }
  const sessionEntity = new SessionEntity(sessionSchema, session.sessionID, {
    ...session,
  });
  console.log(
    chalk.greenBright(
      `Created session for “${session.email}” with entity ID ${await save(
        sessionEntity
      )}.`
    )
  );
  await renew(session.sessionID);
  return true;
};

export const renewSession = async (sessionID: string) => {
  const sessionEntity = await fetch(sessionID);
  if (sessionEntity && sessionEntity.email) {
    renew(sessionID);
  } else {
    throw new APIError(404, `Session ${sessionID} not found.`);
  }
};

export const readSession = async (sessionID: string) => {
  const sessionEntity = await fetch(sessionID);
  if (sessionEntity && sessionEntity.email) {
    return new Session(sessionEntity);
  } else {
    throw new APIError(404, `Session ${sessionID} not found.`);
  }
};

export const deleteSession = async (sessionID: string) => {
  const sessionEntity = await fetch(sessionID);
  if (sessionEntity && sessionEntity.email) {
    const email = new Session(sessionEntity).email;
    await remove(sessionEntity.entityId);
    console.log(
      chalk.greenBright(`Deleted session “${email}” (sessionID ${sessionID}).`)
    );
  } else {
    throw new APIError(404, `Session ${sessionID} not found.`);
  }
};
