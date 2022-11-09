/* istanbul ignore file */
import { UserEntity } from "../../../../models/user.js";

let userRepository: Map<string, UserEntity> = new Map<string, UserEntity>();

export const fetch = (id: string) => {
  return userRepository.get(id);
};

export const save = (userEntity: UserEntity) => {
  userRepository.set(userEntity.entityId, userEntity);
  return userEntity.entityId;
};

export const remove = (id: string) => {
  return userRepository.delete(id);
};
