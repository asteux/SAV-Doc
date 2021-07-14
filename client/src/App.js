import React from "react";
import { Redirect, Route, Switch } from 'react-router';

import "./App.css";

const App = () => {
  return (
    <Switch>
      <Route exact path="/" render={() => (<div>Home</div>)} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default App;
