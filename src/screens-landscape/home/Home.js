//import liraries
import React, {Component} from 'react';
import AKUA_HOME from '../themes/Akua/home/Home';
import HONUA_HOME from '../themes/Honua/home/Home';
import RHODIUM_HOME from '../themes/Rhodium/home/Home';
import IRIDIUM_HOME from '../themes/Iridium/home/Home';
import PALLADIUM_HOME from '../themes/Palladium/home/Home';
import TITANIUM_HOME from '../themes/Titanium/home/Home';

var GLOBALModule = require('../../datalayer/global');
var GLOBAL = GLOBALModule.default;

class Home extends Component {
    getTheme() {
        switch (GLOBAL.App_Theme) {
            case 'Akua':
                return <AKUA_HOME>{this.props.children}</AKUA_HOME>;
            case 'Honua':
                return <HONUA_HOME>{this.props.children}</HONUA_HOME>;
            case 'Rhodium':
                return <RHODIUM_HOME>{this.props.children}</RHODIUM_HOME>;
            case 'Iridium':
                return <IRIDIUM_HOME>{this.props.children}</IRIDIUM_HOME>;
            case 'Palladium':
                return <PALLADIUM_HOME>{this.props.children}</PALLADIUM_HOME>;
            case 'Titanium':
                return <TITANIUM_HOME>{this.props.children}</TITANIUM_HOME>;
            default:
                return <AKUA_HOME>{this.props.children}</AKUA_HOME>;
        }
    }
    render() {
        return this.getTheme();
    }
}
export default Home;
