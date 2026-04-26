import React from "react";
import PropTypes from "prop-types";

export default function PlayerResult({ index, player }) {
  const formattedPayoff = Number.isFinite(player.payoff)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        player.payoff,
      )
    : player.payoff;

  return (
    <div className="grid-item-container">
      <div className="column">#{index}</div>
      <div className="column player-name">{player.playerName}</div>
      <div className="column">{player.strategyName}</div>
      <div className="column">{formattedPayoff}</div>
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
