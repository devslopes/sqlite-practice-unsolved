const { unlink, open, readFile, copyFile } = require("fs/promises");
const sqlite3 = require("sqlite3");

const testDbPath = "./data/test.db";
const mainDbPath = "./data/main.db";
// todo: delete
const exampleDbPath = "./data/example.db";

const clearDb = async () => {
  await unlink(testDbPath).catch(() => {});

  // rewrite exampleDbPath
  await unlink(exampleDbPath).catch(() => {});
  await open(exampleDbPath, "w").catch(() => {});

  await copyFile(mainDbPath, testDbPath);
};

const runQueries = async (db, filePath) => {
  const file = await readFile(filePath, {
    encoding: "utf-8",
  });
  const lines = file.split("\n");
  const queries = [];
  for (let line of lines) {
    if (line.includes("--")) {
      queries.push("");
      continue;
    }
    queries[queries.length - 1] = queries[queries.length - 1] + line;
  }

  for (let query of queries) {
    await db.run(query);
  }
};

const promisifySqlite3 = (fn) => (sql, params) =>
  new Promise((resolve, reject) => {
    fn(sql, params, (arg1, arg2, arg3) => {
      if (
        [arg1, arg2, arg3].some((argument) => {
          return argument instanceof Error;
        })
      ) {
        reject(err);
        return;
      }
      resolve([arg1, arg2, arg3]);
      return;
    });
  });

const doesTableExist = async (db, tableName) => {
  const [err, result] = await db.all(queries.getSchema).catch((error) => {
    console.error(error);
  });

  return result.some(
    (entity) =>
      entity.type === "table" &&
      entity.name.toLowerCase() === tableName.toLowerCase()
  );
};

const doesLineExistInTableSchema = async (db, tableName, callback) => {
  const [err, result] = await db.all(queries.getSchema).catch((error) => {
    console.error(error);
  });

  const table = result.find(
    (entity) =>
      entity.type === "table" &&
      entity.name.toLowerCase() === tableName.toLowerCase()
  );

  return table.sql.split("\n").some((line) => {
    return callback(line);
  });
};

const findLineInTableSchema = async (db, tableName, callback) => {
  const [err, result] = await db.all(queries.getSchema).catch((error) => {
    console.error(error);
  });

  const table = result.find(
    (entity) =>
      entity.type === "table" &&
      entity.name.toLowerCase() === tableName.toLowerCase()
  );

  return table.sql.split("\n").find((line) => {
    return callback(line);
  });
};

const getDbInstance = async (path) => {
  const db = await new Promise(async (resolve, reject) => {
    const tempDb = await new sqlite3.Database(path, sqlite3.OPEN_READWRITE);
    tempDb.on("open", () => {
      resolve(tempDb);
      return;
    });
  });

  return {
    run: (sql, params) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, (arg1, arg2, arg3, arg4) => {
          const error = [arg1, arg2, arg3, arg4].find((arg) => {
            return arg?.code === "SQLITE_ERROR";
          });
          if (error) {
            reject(error);
            return;
          }
          resolve([arg1, arg2, arg3, arg4]);
        });
      });
    },
    close: () =>
      new Promise((resolve) => {
        return db.close(resolve);
      }),

    get: (sql, params) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (arg1, arg2, arg3, arg4) => {
          const error = [arg1, arg2, arg3, arg4].find((arg) => {
            return arg?.code === "SQLITE_ERROR";
          });
          if (error) {
            reject(error);
            return;
          }
          resolve([arg1, arg2, arg3, arg4]);
        });
      });
    },
    all: (sql, params) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (arg1, arg2, arg3, arg4) => {
          const error = [arg1, arg2, arg3, arg4].find((arg) => {
            return arg?.code === "SQLITE_ERROR";
          });
          if (error) {
            reject(error);
            return;
          }
          resolve([arg1, arg2, arg3, arg4]);
        });
      });
    },
    each: promisifySqlite3(db.each),
  };
};
const queries = {
  getSchema: "select * from sqlite_master where type='table'",
};

const getAllUsers = async (db) => {
  const all = await db.all("select * from users");
  return all;
};

const findUserByName = async (db, name) => {
  const [_, allUsers] = await getAllUsers(db);
  const [firstName, lastName] = name.split(" ");
  return allUsers.find(
    (user) => user.first_name === firstName && user.last_name === lastName
  );
};

const findAllFavoritesByName = async (db, name) => {
  const [_, allFavorites] = await db.all(`
    SELECT *
    from favorites
        join dogs ON favorites.user_id = users.id
        join users ON favorites.dog_id = dogs.id;
`);
  const [firstName, lastName] = name.split(" ");
  return allFavorites.filter((favorite) => {
    return favorite.first_name === firstName && favorite.last_name === lastName;
  });
};

const addUser = async (db, { firstName, lastName, motto, password }) => {
  await db.get(
    `INSERT INTO USERS (first_name, last_name, motto, password) VALUES (?, ?, ?, ?)`,
    [firstName, lastName, motto, password]
  );

  const allUsers = (await getAllUsers(db))[1];
  const user = allUsers.at(-1);
  return user;
};

const normalizeLine = (line) =>
  line
    .split(" ")
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word !== "")
    .join(" ");
const alphabeticSorter = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  return -1;
};

module.exports = {
  getDbInstance,
  clearDb,
  queries,
  runQueries,
  getAllUsers,
  addUser,
  doesTableExist,
  doesLineExistInTableSchema,
  normalizeLine,
  findLineInTableSchema,
  findUserByName,
  findAllFavoritesByName,
  alphabeticSorter,
};
