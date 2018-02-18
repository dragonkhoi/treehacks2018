import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

//PUSHDOWN
//Pushes screen down under notif bar
export default class PushDown extends React.Component {
  render() {
    return (
      <View style={styles.pushStyle}></View>
    );
  }
}

const styles = StyleSheet.create({
  pushStyle: {
    ...Platform.select({
      ios: {
        backgroundColor: 'white',
        height: 20,
      },
      android: {
        backgroundColor: 'white',
        height: 25,
      },
      windows: {
        backgroundColor: 'white',
        paddingTop: 25,
      },
    })
  },
});
