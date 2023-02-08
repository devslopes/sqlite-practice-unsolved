const { getDbInstance, clearDb, alphabeticSorter } = require("../helpers");

const { readFileSync } = require("fs");

describe("messing around", () => {
  let db;

  beforeAll(async () => {
    await clearDb();
    db = await getDbInstance("./data/test.db");
  });

  it("the file at 'data/main.db' should exist", () => {
    const filepath = "data/main.db";
    const file = readFileSync(filepath);
    expect(file).toBeDefined();
  });

  const findAllKnownDogs = (arr) => ({
    doomslayer: arr.find((d) => d.name === "DOOMSLAYER"),
    jefferey: arr.find((d) => d.name === "Jefferey"),
    zoey: arr.find((d) => d.name === "Zoey"),
  });

  describe("a", () => {
    const file = readFileSync("part2/a.sql", { encoding: "utf-8" });
    it("should return all properties on all of the dogs", async () => {
      const [__, result] = await db.all(file);
      const { doomslayer, zoey, jefferey } = findAllKnownDogs(result);

      [doomslayer, zoey, jefferey].forEach((dog) => {
        expect(dog).toHaveProperty("id");
        expect(dog).toHaveProperty("name");
      });
    });
  });

  describe("b", () => {
    const file = readFileSync("part2/b.sql", { encoding: "utf-8" });
    it("should return a list of names", async () => {
      const [__, result] = await db.all(file);
      const { doomslayer, zoey, jefferey } = findAllKnownDogs(result);

      [doomslayer, zoey, jefferey].forEach((dog) => {
        expect(dog).not.toHaveProperty("id");
        expect(dog).toHaveProperty("name");
      });
    });
    it("should be ordered by name", async () => {
      const [__, result] = await db.all(file);
      const resultClone = result.slice();
      resultClone.sort((a, b) => alphabeticSorter(b.name, a.name));

      expect(resultClone).toEqual(result);
    });
  });

  describe("c", () => {
    const file = readFileSync("part2/c.sql", { encoding: "utf-8" });
    it("should return doomslayer and only doomslayer", async () => {
      const [__, result] = await db.all(file);
      const { doomslayer, zoey, jefferey } = findAllKnownDogs(result);

      expect(doomslayer).toBeDefined();
      expect(zoey).not.toBeDefined();
      expect(jefferey).not.toBeDefined();
    });
  });

  describe("d", () => {
    const file = readFileSync("part2/d.sql", { encoding: "utf-8" });
    it("should get me all of the first_names and last_names that favorited Zoey", async () => {
      const [__, result] = await db.all(file);
      expect(result).toEqual([
        { first_name: "Andrey", last_name: "Rusterton" },
      ]);
    });
  });

  describe("e", () => {
    const file = readFileSync("part2/d.sql", { encoding: "utf-8" });
    it("should get me all of the first_names and last_names that favorited Zoey", async () => {
      const [__, result] = await db.all(file);
      expect(result).toEqual([
        { first_name: "Andrey", last_name: "Rusterton" },
      ]);
    });
  });
});
