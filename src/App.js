import "./styles.css";
import React, { useReducer, useState } from "react";

const Players = ({ onSubmit }) => {
  const [gold, setGold] = useState(10000);
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  return (
    <div style={{ color: "#4bb7db" }}>
      <h3>Add Players</h3>
      <div style={{ marginBottom: 16, color: "#bdae2a" }}>
        Gold to start with:
        <input
          type="number"
          value={gold}
          onChange={(e) => setGold(e.target.value)}
          style={{ margin: 8 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{
            marginRight: 8
          }}
        />
        <button
          onClick={() => {
            setPlayers([...players, playerName]);
            setPlayerName("");
          }}
        >
          Add Player
        </button>
      </div>

      <div style={{ display: "flex", marginBottom: 16 }}>
        {players.map((player) => {
          return (
            <div
              key={`player-name-${player}`}
              style={{
                margin: 5,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                width: "200px",
                height: "80px",
                border: "1px solid #4bb7db",
                borderRadius: 4,
                color: "#4bb7db"
              }}
            >
              <div
                name={player}
                style={{
                  color: "#f27eb0",
                  position: "absolute",
                  top: 0,
                  left: 3,
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (!players.includes(player)) return;
                  const index = players.indexOf(player);
                  const transformedArray = [...players];
                  transformedArray.splice(index, 1);
                  setPlayers(transformedArray);
                }}
              >
                x
              </div>
              {player}
            </div>
          );
        })}
      </div>
      {(players.length && (
        <button
          onClick={() =>
            onSubmit({
              step: 1,
              payload: { players, gold }
            })
          }
        >
          Create
        </button>
      )) ||
        null}
    </div>
  );
};

const Payment = ({ players, onSubmit }) => {
  const [state, setState] = useState({});
  return (
    <div>
      <h3 style={{ color: "#fc5203" }}>Payments</h3>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: 16
        }}
      >
        {players.map((player, index) => {
          return (
            <div
              key={`payment-card-${player.name}-${index}`}
              style={{
                margin: 8,
                border: "1px solid #bd5b2a",
                width: 200,
                minHeight: 300
              }}
            >
              <h3>{player.name}</h3>
              <input
                type="number"
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    const value = e.target.value;
                    const otherPayments = state[player.name];
                    const playerPayments = {
                      [player.name]: [
                        parseInt(value),
                        ...(otherPayments ? otherPayments : [])
                      ]
                    };
                    value &&
                      setState({
                        ...state,
                        ...playerPayments
                      });
                  }
                }}
              />
              <div style={{ margin: 18 }}>
                {state[player.name] &&
                  state[player.name].map((payment) => {
                    return (
                      <div
                        key={`payment-${player.name}-${payment}`}
                        style={{ margin: 5, color: "#f2543f" }}
                      >
                        -{payment}
                      </div>
                    );
                  })}
              </div>
              {state[player.name] && (
                <div style={{ marginTop: "auto" }}>
                  total: {state[player.name].reduce((a, b) => a + b, 0)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => onSubmit({ step: 2, payload: state })}>
        Submit
      </button>
    </div>
  );
};

const createPlayer = (playerName, gold) => ({
  name: playerName,
  gold
});

const createPlayers = ({ players, gold }) =>
  players.reduce((accumulator, current) => {
    return [...accumulator, createPlayer(current, gold)];
  }, []);

const mapPayments = (paymentsMap, players) =>
  players.map((player) => ({
    ...player,
    payments: paymentsMap[player.name],
    add: Object.keys(paymentsMap)
      .filter((name) => name !== player.name)
      .map((key) => paymentsMap[key])
      .flat(1)
  }));

const initialState = {
  step: 1,
  players: []
};

const reducer = (state, action) => {
  switch (action.step) {
    case 1:
      return {
        ...state,
        ...{ step: 2, players: createPlayers(action.payload) }
      };
    case 2:
      return {
        ...state,
        ...{ step: 3, players: mapPayments(action.payload, state.players) }
      };
    default:
      return state;
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log(state);
  return (
    <div className="App">
      <h1>Heroes 3 Calculator</h1>
      <h3>calculates gold transfer</h3>
      {state.step === 1 && <Players onSubmit={dispatch} />}
      {state.step === 2 && (
        <Payment onSubmit={dispatch} players={state.players} />
      )}
      {state.step === 3 && (
        <div>
          <h3>Summary</h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {state.players.map((player) => {
              const amountToAdd = player.add.reduce((a, b) => a + b, 0);
              const amountToTake = player.payments.reduce((a, b) => a + b, 0);
              const totalGold = player.gold + amountToAdd - amountToTake;
              return (
                <div
                  style={{
                    margin: 5,
                    padding: 8,
                    border: "1px solid red"
                  }}
                >
                  <h4>{player.name}</h4>
                  <div>
                    Recived: {amountToAdd}
                    <br />
                    {player.add.map((g) => `-  ${g} `)}
                  </div>
                  <br />
                  <br />
                  <div>
                    Payments: {amountToTake}
                    <br />
                    {player.payments.map((g) => g)}
                  </div>
                  <br />
                  <div>Total gold: {totalGold} </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
