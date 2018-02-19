//Install react navigation by: npm install --save react-navigation
import React from 'react';
import LaunchScreen from './components/LaunchScreen';
import ScanSurroundings from './components/ScanSurroundings';

import { StackNavigator } from 'react-navigation';

export default class App extends React.Component {

  render() {
    console.disableYellowBox = true;
    return <Treehacks_stack />;
  }
}

const Treehacks_stack = StackNavigator({
  LaunchScreen: { screen: LaunchScreen },
  ScanSurroundings: { screen: ScanSurroundings },
});
