import React from 'react';
import logo from './logo.svg';
import './App.css';
import PathFinderUI from "./PathFinderUI";
import AStar from "./PathFinderUI/AStar";

function App() {
  return (
    <div className={'App'}>
      {/*<PathFinderUI />*/}
        <AStar/>
    </div>
  );
}

export default App;
