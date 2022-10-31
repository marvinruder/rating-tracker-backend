import axios from "axios";

export const sendMessage = (message: string) => {
  if (
    process.env.SIGNAL_URL &&
    process.env.SIGNAL_SENDER &&
    process.env.SIGNAL_RECIPIENT
  ) {
    axios.post(process.env.SIGNAL_URL + "/v2/send", {
      message: message,
      number: process.env.SIGNAL_SENDER,
      recipients: process.env.SIGNAL_RECIPIENT.split(" "),
    });
  }
};
