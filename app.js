const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
// GET API
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM player_details;`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
// GET API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});
//PUT API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const putPlayerQuery = `UPDATE player_details SET player_name='${playerName}'
  WHERE player_id=${playerId};`;
  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT * FROM match_details WHERE match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(convertDbObjectToResponseObject2(match));
});
const convertDbObjectToResponseObject3 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

// GET MATCH API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `SELECT * FROM player_match_score NATURAL JOIN
  match_details WHERE player_id=${playerId};`;
  const match = await db.get(getMatchQuery);
  response.send(convertDbObjectToResponseObject3(match));
});
module.exports = app;
