const {
  getDbInstance,
  clearDb,
  runQueries,
  queries,
  findAllFavoritesByName: findAllFavoritesByName,
  doesTableExist,
  doesLineExistInTableSchema,
  normalizeLine,
  findLineInTableSchema,
  findUserByName,
} = require("../helpers");

const { readFileSync } = require("fs");

describe("messing around", () => {
  let db;
  // let exampleDb;

  beforeAll(async () => {
    await clearDb();
    db = await getDbInstance("./data/test.db");
    // exampleDb = await getDbInstance("./data/example.db");

    // for local development of the exercise this can be extremely useful
    // await runQueries(exampleDb, "schema.sql")
    //   .then(() => {
    //     console.log("created users table on example db");
    //   })
    //   .catch((err) => console.error(err));
  });

  it("the file at 'data/main.db' should exist", () => {
    const filepath = "data/main.db";
    const file = readFileSync(filepath);
    expect(file).toBeDefined();
  });

  describe("users table", () => {
    it("should have a users table in the schema", async () => {
      expect(await doesTableExist(db, "users")).toBe(true);
    });

    it("should have an id column on the users table that is an integer", async () => {
      expect(
        await doesLineExistInTableSchema(db, "users", (line) => {
          return normalizeLine(line).includes("id integer");
        })
      ).toBe(true);
    });

    it("id column should be a primary key", async () => {
      expect(
        await doesLineExistInTableSchema(db, "users", (line) => {
          return normalizeLine(line).includes("id integer primary key");
        })
      ).toBe(true);
    });

    it("should have a first_name column that is text", async () => {
      expect(
        await doesLineExistInTableSchema(db, "users", (line) => {
          return normalizeLine(line).includes("first_name text");
        })
      ).toBe(true);
    });

    it("first_name column should be non nullable", async () => {
      const firstNameColumn = await findLineInTableSchema(db, "users", (line) =>
        normalizeLine(line).includes("first_name text")
      );
      expect(normalizeLine(firstNameColumn).includes("not null")).toBe(true);
    });

    it("should have a last_name column that is text", async () => {
      expect(
        await doesLineExistInTableSchema(db, "users", (line) => {
          return normalizeLine(line).includes("last_name text");
        })
      ).toBe(true);
    });

    it("last_name column should be non nullable", async () => {
      const lastNameColumn = await findLineInTableSchema(db, "users", (line) =>
        normalizeLine(line).includes("last_name text")
      );
      expect(normalizeLine(lastNameColumn).includes("not null")).toBe(true);
    });

    it("motto column should exist", async () => {
      const lastNameColumn = await findLineInTableSchema(db, "users", (line) =>
        normalizeLine(line).includes("motto text")
      );
      expect(lastNameColumn).toBeDefined();
    });

    it("the motto column should be nullable", async () => {
      const lastNameColumn = await findLineInTableSchema(db, "users", (line) =>
        normalizeLine(line).includes("motto text")
      );
      expect(lastNameColumn.includes("not null")).toBe(false);
    });
  });

  describe("dogs table", () => {
    it("should have a dogs table in the schema", async () => {
      expect(await doesTableExist(db, "dogs")).toBe(true);
    });

    it("should have an id column on the dogs table that is an integer", async () => {
      expect(
        await doesLineExistInTableSchema(db, "dogs", (line) => {
          return normalizeLine(line).includes("id integer");
        })
      ).toBe(true);
    });

    it("dogs id column should be a primary key", async () => {
      expect(
        await doesLineExistInTableSchema(db, "dogs", (line) => {
          return normalizeLine(line).includes("id integer primary key");
        })
      ).toBe(true);
    });

    it("should have a name column that is text", async () => {
      expect(
        await doesLineExistInTableSchema(db, "dogs", (line) => {
          return normalizeLine(line).includes("name text");
        })
      ).toBe(true);
    });

    it("name column should be non nullable", async () => {
      const nameColumn = await findLineInTableSchema(db, "dogs", (line) =>
        normalizeLine(line).includes("name text")
      );
      expect(normalizeLine(nameColumn).includes("not null")).toBe(true);
    });
  });

  describe("favorites table", () => {
    it("should have a favorites table in the schema", async () => {
      expect(await doesTableExist(db, "favorites")).toBe(true);
    });

    it("should have an id column on the favorites table that is an integer", async () => {
      expect(
        await doesLineExistInTableSchema(db, "favorites", (line) => {
          return normalizeLine(line).includes("id integer");
        })
      ).toBe(true);
    });

    it("should have a user_id column on the favorites table that is an integer", async () => {
      expect(
        await doesLineExistInTableSchema(db, "favorites", (line) => {
          return normalizeLine(line).includes("user_id integer");
        })
      ).toBe(true);
    });

    it("should have a dog_id column on the favorites table that is an integer", async () => {
      expect(
        await doesLineExistInTableSchema(db, "favorites", (line) => {
          return normalizeLine(line).includes("dog_id integer");
        })
      ).toBe(true);
    });

    it("you should not be able to create two favorites with the same dog_id and user_id", async () => {
      expect(
        await doesLineExistInTableSchema(db, "favorites", (line) => {
          return (
            normalizeLine(line).includes("unique(user_id, dog_id)") ||
            normalizeLine(line).includes("unique(dog_id, user_id)")
          );
        })
      ).toBe(true);
    });
    it("should have a favorite that connects jon to doomslayer", async () => {
      const petersFavorites = await findAllFavoritesByName(db, "Peter Garboni");
      expect(
        petersFavorites.find((favorite) => favorite.name === "DOOMSLAYER")
      ).toBeDefined();
    });

    it("should have a favorite that connects peter to DOOMSLAYER", async () => {
      const petersFavorites = await findAllFavoritesByName(db, "Peter Garboni");
      expect(
        petersFavorites.find((favorite) => favorite.name === "DOOMSLAYER")
      ).toBeDefined();
    });

    it("should have a favorite that connects jon to DOOMSLAYER", async () => {
      const jonsFavorites = await findAllFavoritesByName(db, "Jon Higgz");
      expect(
        jonsFavorites.find((favorite) => favorite.name === "DOOMSLAYER")
      ).toBeDefined();
    });

    it("should have a favorite that connects andrey to DOOMSLAYER", async () => {
      const andreysFavorites = await findAllFavoritesByName(
        db,
        "Andrey Rusterton"
      );
      expect(
        andreysFavorites.find((favorite) => favorite.name === "DOOMSLAYER")
      ).toBeDefined();
    });

    it("should have a favorite that connects jon to jefferey", async () => {
      const jonsFavorites = await findAllFavoritesByName(db, "Jon Higgz");
      expect(
        jonsFavorites.find((favorite) => favorite.name === "Jefferey")
      ).toBeDefined();
    });

    it("should have a favorite that connects andrey to zoey", async () => {
      const andreysFavorites = await findAllFavoritesByName(
        db,
        "Andrey Rusterton"
      );
      expect(
        andreysFavorites.find((favorite) => favorite.name === "Zoey")
      ).toBeDefined();
    });
  });
});
