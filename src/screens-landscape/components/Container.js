import React, {Component} from 'react';
import AKUA_THEME from '../themes/Akua/Akua';
import HONUA_THEME from '../themes/Honua/Honua';
import DEFAULT_THEME from '../themes/Default/Default';
import RHODIUM_THEME from '../themes/Rhodium/Rhodium';
import IRIDIUM_THEME from '../themes/Iridium/Iridium';
import PALLADIUM_THEME from '../themes/Palladium/Palladium';

class Container extends Component {
    constructor(props) {
        super(props);
    }
    getTheme() {
        switch (GLOBAL.App_Theme) {
            case 'Akua':
                return (
                    <AKUA_THEME
                        needs_notch={this.props.needs_notch}
                        blur={this.props.blur}
                        background={
                            this.props.background != null ||
                            this.props.background == ''
                                ? this.props.background
                                : GLOBAL.Background
                        }
                        hide_header={this.props.hide_header}
                        hide_menu={this.props.hide_menu}
                    >
                        {this.props.children}
                    </AKUA_THEME>
                );
                break;
            case 'Honua':
                return (
                    <HONUA_THEME
                        needs_notch={this.props.needs_notch}
                        blur={this.props.blur}
                        background={
                            this.props.background != null ||
                            this.props.background == ''
                                ? this.props.background
                                : GLOBAL.Background
                        }
                        hide_header={this.props.hide_header}
                        hide_menu={this.props.hide_menu}
                        is_landscape={this.props.is_landscape}
                    >
                        {this.props.children}
                    </HONUA_THEME>
                );
                break;
            case 'Rhodium':
                return (
                    <RHODIUM_THEME
                        needs_notch={this.props.needs_notch}
                        blur={this.props.blur}
                        background={
                            this.props.background != null ||
                            this.props.background == ''
                                ? this.props.background
                                : GLOBAL.Background
                        }
                        hide_header={this.props.hide_header}
                        hide_menu={this.props.hide_menu}
                        is_landscape={this.props.is_landscape}
                    >
                        {this.props.children}
                    </RHODIUM_THEME>
                );
                break;
            case 'Iridium':
                return (
                    <IRIDIUM_THEME
                        needs_notch={this.props.needs_notch}
                        blur={this.props.blur}
                        background={
                            this.props.background != null ||
                            this.props.background == ''
                                ? this.props.background
                                : GLOBAL.Background
                        }
                        hide_header={this.props.hide_header}
                        hide_menu={this.props.hide_menu}
                        is_landscape={this.props.is_landscape}
                    >
                        {this.props.children}
                    </IRIDIUM_THEME>
                );
                break;
            case 'Palladium':
                return (
                    <PALLADIUM_THEME
                        needs_notch={this.props.needs_notch}
                        blur={this.props.blur}
                        background={
                            this.props.background != null ||
                            this.props.background == ''
                                ? this.props.background
                                : GLOBAL.Background
                        }
                        hide_header={this.props.hide_header}
                        hide_menu={this.props.hide_menu}
                        is_landscape={this.props.is_landscape}
                    >
                        {this.props.children}
                    </PALLADIUM_THEME>
                );
                break;
            default:
                return (
                    <DEFAULT_THEME
                        needs_notch={this.props.needs_notch}
                        blur={this.blur}
                        background={
                            this.props.background != null ||
                            this.props.background == ''
                                ? this.props.background
                                : GLOBAL.Background
                        }
                        hide_header={this.props.hide_header}
                        hide_menu={this.props.hide_menu}
                    >
                        {this.props.children}
                    </DEFAULT_THEME>
                );
                break;
        }
    }
    render() {
        return this.getTheme();
    }
}
export default Container;
