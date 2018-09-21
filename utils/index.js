import config from "config-yml";
import dotenv from "dotenv";
import request from "async-request";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const slackToken = process.env.SLACK_TOKEN;

export const getUserInfo = async id => {
  const url = `https://slack.com/api/users.profile.get?token=${slackToken}&user=${id}`;
  let response;
  try {
    response = await request(url);
  } catch (e) {
    console.log(
      getStyleLog("red"),
      "Error: https://api.slack.com/apps/{your-app}/oauth?",
      e
    );
    console.log(e);
  }

  return response && JSON.parse(response.body);
};

export const getChannelInfo = async id => {
  const url = `https://slack.com/api/channels.info?token=${slackToken}&channel=${id}`;
  let response;

  try {
    response = await request(url);
  } catch (e) {
    console.log(
      getStyleLog("red"),
      "Error: https://api.slack.com/apps/{your-app}/oauth?",
      e
    );
  }

  return response && JSON.parse(response.body);
};

export const calculateScore = (interaction, userId) => {
  let score = 0;
  if (interaction.user === userId) {
    if (interaction.type === "message") {
      score = config.xprules.messages.send;
    } else if (
      interaction.type === "reaction_added" &&
      interaction.parentUser !== userId
    ) {
      score = config.xprules.reactions.send;
    } else if (interaction.parentUser !== userId) {
      score = config.xprules.threads.send;
    }
  } else if (interaction.type === "thread") {
    score = config.xprules.threads.receive;
  } else if (
    interaction.description === "disappointed" ||
    interaction.description === "-1"
  ) {
    score = config.xprules.reactions.receive.negative;
  } else {
    score = config.xprules.reactions.receive.positive;
  }
  return score;
};

export const calculateLevel = score => {
  const level = config.levelrules.levels_range.findIndex(l => score < l) + 1;
  return level;
};

export const isValidChannel = channel => {
  let validChannels = [];
  if (process.env.NODE_ENV !== "production") {
    validChannels = process.env.CHANNELS.split(" ");
  } else {
    validChannels = config.channels.valid_channels;
  }
  const isValid = validChannels.find(item => item === channel);

  return !!isValid;
};

export const getStyleLog = style => {
  const styles = {
    black: "\x1b[30m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    magenta: "\x1b[35m",
    red: "\x1b[31m",
    white: "\x1b[37m",
    yellow: "\x1b[33m",
    reset: "\x1b[0m",
    reverse: "\x1b[7m",
    underscore: "\x1b[4m"
  };

  return `${styles[style]}%s${styles.reset}`;
};