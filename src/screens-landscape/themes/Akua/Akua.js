import React, {Component} from 'react';
import {Actions} from 'react-native-router-flux';
import {View} from 'react-native';
import MENU from './menu/Menu';
import BACKGROUND from '../../components/Background';
import UPDATE from '../../../datalayer/update';
import EXPIRE from '../../../datalayer/expire';
import OFFLINE from '../../../datalayer/offline';
import MESSAGE from '../../../datalayer/message';
import SUBSCRIPTION from '../../../datalayer/subscription';
import ACTION from '../../../datalayer/action';
class Akua extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyUpListener(keyEvent => {
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
                <View
                    style={{width: '100%', zIndex: 9999, position: 'absolute'}}
                >
                    <ACTION />
                    <SUBSCRIPTION />
                    <MESSAGE />
                </View>
                <OFFLINE />
                <EXPIRE />
                {/* {RenderIf(this.props.hide_header != true)(
                    <HEADER />
                )} */}
                <View
                    style={{
                        flex: 40,
                        marginTop:
                            GLOBAL.Device_HasNotch && this.props.needs_notch
                                ? 35
                                : 0,
                    }}
                >
                    <UPDATE />
                    {this.props.children}
                </View>
                {RenderIf(this.props.hide_menu != true)(<MENU />)}
            </BACKGROUND>
        );
    }
}
export default Akua;
