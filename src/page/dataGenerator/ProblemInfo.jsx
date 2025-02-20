import React from "react";
import PropTypes from "prop-types";

export const SMTProblemInfo = ({ data, infoVisible }) => {
  return (
    <div
      className={
        "card border-secondary mb-4 border-3 rounded-4 shadow-sm bg-light" +
        (infoVisible ? "" : " d-none")
      }
    >
      <div className="card-body px-5 py-4">
        <div className="mb-2">
          <div className="fw-bold">Problem name</div>
          <span className="small">{data.problemName}</span>
        </div>
        <div className="row">
          <div className="col">
            <div className="fw-bold">Number of set</div>
            <div className="small">{data.numberOfSet}</div>
          </div>
          <div className="col">
            <div className="fw-bold">
              Characteristics [<span>{data.characteristic.length}</span>]
            </div>
            <div className="small">
              {data.characteristic.map((e, i) =>
                i === data.characteristic.length - 1 ? e : e + ", ",
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GTProblemInfo = ({ data, infoVisible }) => {
  return (
    <div
      className={
        "card border-secondary mb-4 border-3 rounded-4 shadow-sm bg-light" +
        (infoVisible ? "" : " d-none")
      }
    >
      <div className="card-body px-5 py-4">
        <div className="mb-2">
          <div className="fw-bold">Problem name</div>
          <span className="small">{data.problemName}</span>
        </div>
        <div className="row">
          <div className="col">
            <div className="fw-bold">Number of player</div>
            <div className="small">{data.numberOfPlayer}</div>
          </div>
          <div className="col">
            <div className="fw-bold">Number of property</div>
            <div className="small">{data.numberOfProperty}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

SMTProblemInfo.propTypes = {
  data: PropTypes.object,
  infoVisible: PropTypes.bool,
};

GTProblemInfo.propTypes = {
  data: PropTypes.object,
  infoVisible: PropTypes.bool,
};
