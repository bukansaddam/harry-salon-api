"use strict";

const { nanoid } = require("nanoid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "hairstyle_images",
      [
        {
          id: nanoid(10),
          image:
            "https://harrysalon.sgp1.cdn.digitaloceanspaces.com/images/hairstyles/buzzcut.jpg",
          hairstyleId: "buzzcut1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: nanoid(10),
          image:
            "https://harrysalon.sgp1.cdn.digitaloceanspaces.com/images/hairstyles/crew%20cut.jpg",
          hairstyleId: "crewcut1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: nanoid(10),
          image:
            "https://harrysalon.sgp1.cdn.digitaloceanspaces.com/images/hairstyles/Pompadour.jpg",
          hairstyleId: "pompadour1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: nanoid(10),
          image:
            "https://harrysalon.sgp1.cdn.digitaloceanspaces.com/images/hairstyles/Quiff.jpg",
          hairstyleId: "quiff1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: nanoid(10),
          image:
            "https://harrysalon.sgp1.cdn.digitaloceanspaces.com/images/hairstyles/side%20part.jpg",
          hairstyleId: "sidepart1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: nanoid(10),
          image:
            "https://harrysalon.sgp1.cdn.digitaloceanspaces.com/images/hairstyles/Undercut.jpg",
          hairstyleId: "undercut1",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("hairstyle_images", null, {});
  },
};
