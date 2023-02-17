"use strict";

const license = (__, args, ctx) => {
  const { key } = args;

  return {
    id: "1234",
    body: "This is a test license",
    description: `This is a description with key ${key}`
  };
};

module.exports = {
  Query: {
    license
  }
};
