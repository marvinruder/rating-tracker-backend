import SimpleWebAuthnServer from "@simplewebauthn/server";
import { AuthenticatorDevice } from "@simplewebauthn/typescript-types";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { Buffer } from "node:buffer";
import { GENERAL_ACCESS } from "../accessRights.js";
import APIError from "../apiError.js";
import {
  createUser,
  readUser,
  updateUser,
  userExists,
} from "../redis/repositories/user/userRepository.js";

dotenv.config({
  path: ".env.local",
});

const rpName = "Rating Tracker";
const rpID = `${process.env.DOMAIN}`;
const origin = `https://${process.env.SUBDOMAIN}.${rpID}`;

const currentChallenges = {};

class AuthController {
  getRegistrationOptions(req: Request, res: Response) {
    const email = req.query.email;
    const name = req.query.name;
    if (typeof email === "string" && typeof name === "string") {
      if (userExists(email)) {
        throw new APIError(
          403,
          "This email address is already registered. Please sign in."
        );
      }
      const options = SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: email,
        userName: name,
        attestationType: "none",
        authenticatorSelection: {
          userVerification: "required",
          residentKey: "required",
        },
      });
      currentChallenges[email] = options.challenge;
      return res.status(200).json(options);
    }
    throw new APIError(400);
  }

  async postRegistrationResponse(req: Request, res: Response) {
    const email = req.query.email;
    const name = req.query.name;
    if (typeof email === "string" && typeof name === "string") {
      const expectedChallenge: string = currentChallenges[email];
      let verification;
      try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
          credential: req.body,
          expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          requireUserVerification: true,
        });
      } catch (error) {
        throw new APIError(400, error.message);
      }

      const { verified } = verification;
      const { registrationInfo } = verification;
      const {
        credentialPublicKey,
        credentialID,
        counter,
      }: AuthenticatorDevice = registrationInfo;
      if (
        !(await createUser({
          email,
          name,
          accessRights: 0,
          credentialID: credentialID.toString("base64"),
          credentialPublicKey: credentialPublicKey.toString("base64"),
          counter,
        }))
      ) {
        throw new APIError(
          403,
          "This email address is already registered. Please sign in."
        );
      }
      if (verified) {
        return res.sendStatus(201);
      }
      throw new APIError(400, "Registration failed");
    }
    throw new APIError(400);
  }

  getAuthenticationOptions(req: Request, res: Response) {
    const options = SimpleWebAuthnServer.generateAuthenticationOptions({
      rpID: rpID,
      userVerification: "required",
    });
    currentChallenges[options.challenge] = options.challenge;
    return res.status(200).json(options);
  }

  async postAuthenticationResponse(req: Request, res: Response) {
    const email = req.body.response.userHandle;
    const user = await readUser(email);

    let verification;
    try {
      verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
        credential: req.body,
        expectedChallenge: currentChallenges[req.body.challenge],
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: Buffer.from(user.credentialID, "base64"),
          credentialPublicKey: Buffer.from(user.credentialPublicKey, "base64"),
          counter: user.counter,
        },
        requireUserVerification: true,
      });
    } catch (error) {
      throw new APIError(400, error.message);
    }

    const { verified } = verification;
    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;
    if (verified) {
      if ((user.accessRights & GENERAL_ACCESS) == 0) {
        throw new APIError(403, "This user account is not yet activated.");
      }
      await updateUser(email, { counter: newCounter });
      return res.sendStatus(204);
    }
    throw new APIError(400, "Authentication failed");
  }
}
export default new AuthController();
