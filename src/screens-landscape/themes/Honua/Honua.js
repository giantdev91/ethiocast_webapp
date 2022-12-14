import React, {Component} from 'react';
import {Actions} from 'react-native-router-flux';
import {View} from 'react-native';
import MENU from './menu/Menu';
import HEADER from './header/Header';
import BACKGROUND from '../../components/Background';
import UPDATE from '../../../datalayer/update';
import EXPIRE from '../../../datalayer/expire';
import OFFLINE from '../../../datalayer/offline';
class Honua extends Component {
    constructor(props) {
        super(props);
        // this.hide_menu = this.props.hide_menu;
        // this.hide_header = this.props.hide_header;
        // this.background = this.props.background;
        // this.is_landscape = this.props.is_landscape;
        // this.blur = this.props.blur;
    }
    componentDidMount() {
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (GLOBAL.IsHomeLoaded == true) {
                    if (keyEvent.keyCode == 131) {
                        //television
                        GLOBAL.Focus = 'Television';
                        if (GLOBAL.Channels_Selected.length > 0) {
                            GLOBAL.Channel = UTILS.getChannel(
                                GLOBAL.Channels_Selected[0].channel_id,
                            );
                            Actions.Player({fromPage: 'Home'});
                        }
                    }
                    if (keyEvent.keyCode == 132 || keyEvent.keyCode == 172) {
                        //tvguide
                        Actions.EPG();
                    }
                    if (keyEvent.keyCode == 82) {
                        var DefaultMenu =
                            GLOBAL.UserInterface.general.start_screen;
                        switch (DefaultMenu) {
                            case 'Home':
                                GLOBAL.Focus = 'Home';
                                Actions.Home();
                                break;
                            case 'Channels':
                                GLOBAL.Focus = 'Channels';
                                Actions.Channels();
                                break;
                            case 'TV Guide':
                                GLOBAL.Focus = 'TV Guide';
                                Actions.EPG();
                                break;
                            case 'Television':
                                GLOBAL.Focus = 'Television';
                                if (GLOBAL.Channels_Selected.length > 0) {
                                    GLOBAL.Channel = UTILS.getChannel(
                                        GLOBAL.Channels_Selected[0].channel_id,
                                    );
                                    Actions.Player({fromPage: 'Home'});
                                }
                                break;
                            case 'Movies':
                                GLOBAL.Focus = 'Movies';
                                Actions.Movies_Stores();
                                break;
                            case 'Series':
                                GLOBAL.Focus = 'Series';
                                Actions.Series_Stores();
                                break;
                            case 'Music':
                                GLOBAL.Focus = 'Music';
                                Actions.Music_Albums();
                                break;
                            case 'Apps':
                                GLOBAL.Focus = 'Apps';
                                Actions.MarketPlace();
                                break;
                        }
                    }
                }
                return true;
            });
        }
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
    }
    render() {
        return (
            <BACKGROUND
                background={this.props.background}
                blur={this.props.blur}
            >
                <OFFLINE />
                <EXPIRE />
                <View style={{flex: 1}}>
                    {RenderIf(!GLOBAL.Device_IsPhone)(
                        <View style={{flex: 1}}>
                            {RenderIf(this.props.hide_header != true)(
                                <View style={{flex: 3, flexDirection: 'row'}}>
                                    <HEADER />
                                </View>,
                            )}
                            <View style={{flex: 44, flexDirection: 'row'}}>
                                <UPDATE />
                                {RenderIf(this.props.hide_menu != true)(
                                    <View
                                        style={{
                                            width: GLOBAL.Menu_Width,
                                            paddingTop: 1,
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <MENU />
                                    </View>,
                                )}
                                <View
                                    style={{
                                        flex: 4,
                                        flexDirection: 'column',
                                        marginTop:
                                            this.props.hide_menu != true
                                                ? 5
                                                : 0,
                                    }}
                                >
                                    {this.props.children}
                                </View>
                            </View>
                        </View>,
                    )}
                    {RenderIf(GLOBAL.Device_IsPhone == true)(
                        <View
                            style={{
                                flex: 1,
                                marginTop:
                                    GLOBAL.Device_HasNotch &&
                                    this.props.needs_notch
                                        ? 35
                                        : 0,
                            }}
                        >
                            <UPDATE />
                            {RenderIf(
                                this.props.hide_header != true &&
                                    GLOBAL.Focus == 'Home',
                            )(
                                <View style={{flex: 5, flexDirection: 'row'}}>
                                    <HEADER />
                                </View>,
                            )}
                            {RenderIf(GLOBAL.Focus == 'Home')(
                                <View style={{flex: 30}}>
                                    {this.props.children}
                                </View>,
                            )}
                            {RenderIf(GLOBAL.Focus != 'Home')(
                                <View style={{flex: 35}}>
                                    {this.props.children}
                                </View>,
                            )}
                            {RenderIf(this.props.hide_menu != true)(
                                <View style={{flexDirection: 'row'}}>
                                    <MENU />
                                </View>,
                            )}
                        </View>,
                    )}
                </View>
            </BACKGROUND>
        );
    }
}
export default Honua;
