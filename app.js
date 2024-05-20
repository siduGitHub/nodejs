const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log(`Server running at http://localhost:3000/`),
    )
  } catch (e) {
    console.log(`db error${e.message}`)
  }
}
initializeDbAndServer()

// GET PLAYER TABLE //

app.get('/players/', async (request, response) => {
  const getPlayers = `
        SELECT * FROM player_details;
    `
  const dbResponse = await db.all(getPlayers)
  const playesrDetails = dbResponse.map(eachPlayer => ({
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
  }))
  response.send(playesrDetails)
})

//get player//

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayers = `
        SELECT * FROM player_details WHERE player_id=${playerId};
    `
  const dbResponse = await db.get(getPlayers)
  const playerDetails = {
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
  }

  response.send(playerDetails)
})

// UPDATE PLAYER NAME //

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const updatePlayer = `
    UPDATE player_details 
    SET
      player_name='${playerName}'
    WHERE player_id=${playerId};
  `
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

// GET MATCH DETAILS WITH SPECIFIC ID://
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQiery = `
        SELECT * FROM match_details WHERE match_id=${matchId};
    `
  const dbResponse = await db.get(getMatchQiery)
  const matchDetails = {
    matchId: dbResponse.match_id,
    match: dbResponse.match,
    year: dbResponse.year,
  }

  response.send(matchDetails)
})

// All MATCHES PLAYED BY PLAYER//API 5

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params

  const getMatchIdQurey = `
        SELECT * FROM player_match_score WHERE player_id=${playerId};
    `
  const matchIddbResponse = await db.get(getMatchIdQurey)

  const getMatchesQurey = `
   SELECT * FROM match_details NATURAL JOIN player_match_score WHERE match_id=${matchIddbResponse.match_id}
   GROUP BY match_id;
   `
  const matchDetailsDbResponse = await db.all(getMatchesQurey)

  const MatchrDetails = matchDetailsDbResponse.map(eachMatch => ({
    matchId: eachMatch.match_id,
    match: eachMatch.match,
    year: eachMatch.year,
  }))
  response.send(MatchrDetails)
})

///api 6//

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const playerIdQuery = `
    SELECT player_id FROM player_match_score WHERE match_id=${matchId};
  `
  const playerId = await db.all(playerIdQuery)
  /*
  const playerDetails = `
    SELECT * FROM player_details NATURAL JOIN player_match_score WHERE player_id=${playerIds.player_id};
  `
  const result = await db.all(playerDetails)
  */
  const natutraljoin = `
    SELECT * FROM 
    player_details NATURAL JOIN player_match_score 
    WHERE player_details.player_id=player_match_score.player_id=${playerId.player_id};
  `
  const result = await db.all(natutraljoin)

  response.send(result)
})
