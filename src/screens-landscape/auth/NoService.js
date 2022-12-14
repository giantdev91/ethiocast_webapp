import React, {Component} from 'react';
import {View, Text, TouchableHighlight} from 'react-native';
import OfflineNotice from '../../utils/OfflineNotice';
import RNRestart from 'react-native-restart';

export default class NoService extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
    }
    render() {
        return (
            <View style={{backgroundColor: '#000'}}>
                <OfflineNotice />
                <View
                    style={{
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignSelf: 'center',
                    }}
                >
                    <Text style={styles.Standard}></Text>
                    <Text style={styles.Standard}>{GLOBAL.Device_Model}</Text>
                    <Text style={styles.Standard}>{GLOBAL.Device_Type}</Text>
                    <Text style={styles.Standard}>
                        {GLOBAL.Device_Manufacturer}
                    </Text>
                    <Text style={styles.Standard}>
                        {GLOBAL.Device_UniqueID}
                    </Text>
                    {RenderIf(GLOBAL.Device_System == 'Android')(
                        <TouchableHighlight
                            style={{backgroundColor: '#444'}}
                            underlayColor={'#888'}
                            onPress={() => RNRestart.Restart()}
                        >
                            <View>
                                <Text style={styles.Standard}>
                                    {LANG.getTranslation('retry_loading_app')}
                                </Text>
                            </View>
                        </TouchableHighlight>,
                    )}
                </View>
            </View>
        );
    }
}
