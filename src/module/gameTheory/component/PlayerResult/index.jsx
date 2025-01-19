import React from "react";
import PropTypes from "prop-types";
import "./style.scss";

export default function PlayerResult({ index, player }) {
  return (
    <div className="grid-item-container">
      <div className="column">#{index}</div>
      <div className="column player-name">{player.playerName}</div>
      <div className="column">{player.strategyName}</div>
      <div className="column">{player.payoff}</div>
    </div>
  );
}

PlayerResult.propTypes = {
  index: PropTypes.number.isRequired,
  player: PropTypes.shape({
    playerName: PropTypes.string.isRequired,
    strategyName: PropTypes.string.isRequired,
    payoff: PropTypes.number.isRequired,
  }).isRequired,
};
