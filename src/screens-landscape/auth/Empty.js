import React, {Component} from 'react';
import {View} from 'react-native';

//import Akua from '../themes/Akua/Style';

export default class Empty extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
    }
    componentDidMount() {}
    render() {
        return <View></View>;
    }
}
