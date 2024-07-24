"use strict";

const { nanoid } = require("nanoid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "hairstyles",
      [
        {
          id: "buzzcut1",
          name: "Buzz Cut",
          description: "A very short haircut.",
          isDeleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "crewcut1",
          name: "Crew Cut",
          description: "A slightly longer short haircut.",
          isDeleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "pompadour1",
          name: "Pompadour",
          description: "A hairstyle with volume on top.",
          isDeleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "quiff1",
          name: "Quiff",
          description:
            "A hairstyle that combines the 1950s pompadour with the flattop.",
          isDeleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "sidepart1",
          name: "Side Part",
          description: "A classic and versatile hairstyle.",
          isDeleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "undercut1",
          name: "Undercut",
          description: "A hairstyle with short sides and back, and longer top.",
          isDeleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("hairstyles", null, {});
  },
};
