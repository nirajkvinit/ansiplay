import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AnsiPlay from "./components/layout/AnsiPlay";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Route exact path="/" component={AnsiPlay} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
