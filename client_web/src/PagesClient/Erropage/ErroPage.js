import React from "react";
class ErroPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="container">
        <h1
          className="bg-danger text-grey"
          style={{ width: 1200, padding: 0, margin: "auto" }}
        >
          ErroPage
        </h1>
      </div>
    );
  }
}

export default ErroPage;
