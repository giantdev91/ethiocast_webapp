import React, {Component} from 'react';
import {View} from 'react-native';
import {Actions} from 'react-native-router-flux';

export default class Imports extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        global.GoogleCast = GoogleCast;
        global.CastButton = CastButton;
        Actions.Languages();
    }
    render() {
        return <View></View>;
    }
}
