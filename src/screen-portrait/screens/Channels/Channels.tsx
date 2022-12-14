import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Icon,
    Input,
    Layout,
    Toggle,
    IndexPath,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
import {
    sendPageReport,
    sendActionReport,
    sendSearchReport,
} from '../../../reporting/reporting';
import TimerMixin from 'react-timer-mixin';

//
export default ({ navigation }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [channels, setChannels] = useState([]);
    const [channelsSearch, setChannelsSearch] = useState([]);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [categories, setCategories] = useState(['']);
    const [toggleOrder, setOrder] = useState(true);
    const [toggleView, setView] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortType, setSortType] = useState('123');
    const [viewType, setViewType] = useState('Full');
    const [channelColumnsFull, setChannelColumnsFull] = useState(0);
    const [channelColumnsMini, setChannelColumnsMini] = useState(0);
    const [channelColumns, setChannelColumns] = useState(0);

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);

    var sizes = SIZES.getSizing();

    useEffect(() => {
        return () =>
            sendPageReport('Channels', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        setChannelColumnsFull(GLOBAL.Device_IsPortrait ? 1 : 3);
        setChannelColumnsMini(GLOBAL.Device_IsPortrait ? 3 : 10);
        setChannelColumns(GLOBAL.Device_IsPortrait ? 1 : 3);

        var channelsIn = getChannels(sortType, GLOBAL.Channels_Selected);
        if (channelsIn != undefined) {
            setChannels(channelsIn);
            setChannelsSearch(channelsIn);
        }
        var categoriesIn = [];
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length:
                    category.channels != undefined
                        ? category.channels.length
                        : 0,
            };
            categoriesIn.push(categoryOut);
        });
        if (channelsIn != undefined) {
            var channelsQty = channelsIn;
            if (
                categoriesIn[GLOBAL.Channels_Selected_Category_Index] !=
                undefined
            ) {
                setSelectedCategoryName(
                    categoriesIn[GLOBAL.Channels_Selected_Category_Index].name +
                    ' (' +
                    channelsQty.length +
                    ')',
                );
                setSelectedCategoryIndex(
                    GLOBAL.Channels_Selected_Category_Index,
                );
            } else {
                GLOBAL.Channels_Selected_Category_Index = 0;
                setSelectedCategoryName(
                    categoriesIn[GLOBAL.Channels_Selected_Category_Index].name +
                    ' (' +
                    channelsQty.length +
                    ')',
                );
                setSelectedCategoryIndex(
                    GLOBAL.Channels_Selected_Category_Index,
                );
            }
        }
        setCategories(categoriesIn);

        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.onSpeechResults = onSpeechResultsHandler.bind(this);
        }
        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.isAvailable().then(result => {
                setShowVoiceButton(true);
            });
        }
        return () => {
            TimerMixin.clearTimeout(store_search_timer);
            if (
                GLOBAL.Device_System == 'Apple' ||
                GLOBAL.Device_System == 'Android' ||
                GLOBAL.Device_System == 'Amazon'
            ) {
                Voice.destroy().then(Voice.removeAllListeners);
            }
        };
    }, []);

    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: 'Home' }],
                }),
            );
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);

    const onPressBack = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    const getChannels = (sortType, channels) => {
        if (channels == undefined) {
            return;
        }
        var filtered = channels.filter(function (el) {
            return el != null;
        });
        var originalChannels = filtered;
        originalChannels.sort((channel1, channel2) => {
            if (sortType == 'ABC') {
                const aName = channel1.name;
                const bName = channel2.name;
                if (aName < bName) return -1;
                if (aName > bName) return 1;
                return 0;
            } else {
                if (channel1.channel_number > channel2.channel_number) return 1;
                if (channel1.channel_number < channel2.channel_number)
                    return -1;
                return 0;
            }
        });

        GLOBAL.Channels_Selected = originalChannels;
        return originalChannels;
    };
    const getTvProgram = channel => {
        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.channel_id);
        var currentIndex = 0;
        var epg_ = [];
        var currentProgram = [];
        var percentageProgram = 0;
        var n = 'No Information Available';
        var time = '';
        if (epg_check != undefined) {
            epg_ = epg_check.epgdata;
            currentIndex = epg_.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (currentIndex != undefined) {
                if (epg_[currentIndex] != null) {
                    currentProgram = epg_[currentIndex];
                    n = currentProgram.n;
                    time =
                        moment
                            .unix(currentProgram.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment
                            .unix(currentProgram.e)
                            .format(GLOBAL.Clock_Setting);
                    var totalProgram = currentProgram.e - currentProgram.s;
                    percentageProgram =
                        (currentUnix - currentProgram.s) / totalProgram;
                }
            }
        }
        var width = 0;
        if (channelColumns == 1) {
            width = sizes.width / channelColumns - sizes.width * 0.43;
        } else {
            width = sizes.width / channelColumns - sizes.width * 0.11;
        }

        return (
            <View style={{ flex: 1 }}>
                <Text shadow numberOfLines={1}>
                    {n}
                </Text>
                <View
                    style={{
                        borderTopWidth: 2,
                        borderTopColor: '#999',
                        width: width * percentageProgram,
                    }}
                ></View>
                <Text shadow numberOfLines={1}>
                    {time}
                </Text>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                    {RenderIf(
                        GLOBAL.UserInterface.general.enable_catchuptv == true &&
                        (channel.is_flussonic == 1 || channel.is_dveo == 1),
                    )(
                        <View
                            style={{
                                backgroundColor: 'royalblue',
                                padding: 5,
                                borderRadius: 100,
                                margin: 2,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>,
                    )}
                    {/* {RenderIf(GLOBAL.UserInterface.general.enable_catchuptv == true && (channel.is_flussonic == 1 || channel.is_dveo == 1))(
                        <View style={{ backgroundColor: 'royalblue', padding: 5, borderRadius: 100, margin: 2, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                            <FontAwesome5 style={[{ fontSize: 14, color: '#fff' }]} icon={SolidIcons.recycle} />
                        </View>
                    )} */}
                    {RenderIf(
                        GLOBAL.UserInterface.general.enable_recordings ==
                        true &&
                        (channel.is_flussonic == 1 || channel.is_dveo == 1),
                    )(
                        <View
                            style={{
                                backgroundColor: 'crimson',
                                padding: 4,
                                borderRadius: 100,
                                margin: 2,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.dotCircle}
                                name="dot-circle"
                            />
                        </View>,
                    )}
                </View>
            </View>
        );
    };
    const getLockIcon = item => {
        if (item.childlock == 1) {
            return (
                <FontAwesome5
                    style={[{ fontSize: 14, color: '#fff' }]}
                    // icon={SolidIcons.lock}
                    name="lock"
                />
            );
        } else {
            return null;
        }
    };
    const renderChannel = ({ item, index }) => {
        if (viewType == 'Full') {
            return (
                <FocusButton
                    style={{ width: sizes.width / channelColumns - 4 }}
                    onPress={() => onPlayChannel(item, index)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            margin: 5,
                            borderRadius: 5,
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                            <Image
                                source={{
                                    uri: GLOBAL.ImageUrlCMS + item.icon_big,
                                }}
                                style={{
                                    margin: 10,
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.26
                                        : sizes.width * 0.06,
                                    height: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.26
                                        : sizes.width * 0.06,
                                }}
                            ></Image>
                        </View>
                        <View
                            style={{
                                padding: 5,
                                paddingLeft: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                flex: 1,
                            }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <Text h5 bold shadow numberOfLines={1}>
                                    {item.channel_number} {item.name}
                                </Text>
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        marginLeft: 5,
                                    }}
                                >
                                    {getLockIcon(item)}
                                </View>
                            </View>
                            {getTvProgram(item)}
                        </View>
                    </View>
                </FocusButton>
            );
        } else {
            return (
                <FocusButton
                    style={{ width: sizes.width / channelColumnsMini - 1 }}
                    onPress={() => onPlayChannel(item, index)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            margin: 5,
                            borderRadius: 5,
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                            <Image
                                source={{
                                    uri: GLOBAL.ImageUrlCMS + item.icon_big,
                                }}
                                style={{
                                    margin: 5,
                                    width:
                                        sizes.width / channelColumnsMini - 30,
                                    height:
                                        sizes.width / channelColumnsMini - 30,
                                }}
                            ></Image>
                            <Text
                                size={9}
                                bold
                                shadow
                                numberOfLines={1}
                                style={{
                                    marginLeft: 5,
                                    marginBottom: 5,
                                    width:
                                        sizes.width / channelColumnsMini - 30,
                                }}
                            >
                                {item.channel_number} {item.name}
                            </Text>
                        </View>
                    </View>
                </FocusButton>
            );
        }
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );
    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );
    const onItemSelectCategory = index => {
        var id = categories[index.row].id;
        var category = GLOBAL.Channels.find(x => x.id == id);
        var channels = [];
        if (category != undefined) {
            GLOBAL.Channels_Selected_Category_ID = id;
            if (category.channels.length > 0) {
                GLOBAL.Channels_Selected = category.channels;
                channels = getChannels(sortType, GLOBAL.Channels_Selected);
            }
        }
        GLOBAL.Channels_Selected_Category_Index = index.row;
        setSelectedCategoryName(
            category.name + ' (' + category.channels.length + ')',
        );
        setSelectedCategoryIndex(index.row);
        setCategoryVisible(false);
        setChannels(channels);
        setChannelsSearch(channels);
    };
    const renderCategoryButton = () => (
        <Button onPress={() => setCategoryVisible(true)}>
            {selectedCategoryName}
        </Button>
    );

    const renderCategoryItem = (category, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={category.name + ' (' + category.length + ')'}
        />
    );
    const onToggleOrder = isChecked => {
        sendActionReport(
            'Toggle Order',
            'Channels',
            moment().unix(),
            isChecked,
        );
        setSortType(isChecked ? '123' : 'ABC');
        setOrder(isChecked);
        var channelsOut = getChannels(isChecked ? '123' : 'ABC', channels);
        setChannels(channelsOut);
        setChannelsSearch(channelsOut);
    };
    const onToggleView = isChecked => {
        sendActionReport('Toggle View', 'Channels', moment().unix(), isChecked);
        if (GLOBAL.Device_IsPortrait) {
            setChannelColumns(isChecked ? 1 : 3);
        } else {
            setChannelColumns(isChecked ? 3 : 10);
        }
        setViewType(isChecked ? 'Full' : 'Mini');
        setView(isChecked);
    };
    const onStartSearchTimer = searchTerm => {
        TimerMixin.clearTimeout(store_search_timer);
        store_search_timer = TimerMixin.setTimeout(() => {
            sendSearchReport(moment().unix(), searchTerm);
        }, 2000);
    };
    const onSearchChannels = searchTerm => {
        var channelsSearch_ = channelsSearch.filter(
            c => c.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1,
        );
        setSearchTerm(searchTerm);
        setChannels(channelsSearch_);
    };
    const onStartSpeech = async () => {
        if (showVoiceEnabled == false) {
            setShowVoiceEnabled(true);
            try {
                await Voice.start('en-US');
            } catch (e) {
                setShowVoiceEnabled(false);
                Voice.stop();
            }
        } else {
            setShowVoiceEnabled(false);
            Voice.stop();
        }
    };
    const onSpeechResultsHandler = e => {
        if (e.value != '') {
            try {
                var newInput = e.value;
                var splitInput = newInput.toString().split(',');
                var extraSearch = [];
                splitInput.forEach(element => {
                    var extra = {
                        name: element,
                    };
                    extraSearch.push(extra);
                });
                if (splitInput.length > 0) {
                    Voice.stop().then(() => {
                        sendActionReport(
                            'Search Voice',
                            'Channels',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearchChannels(splitInput[0]);
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearchChannels(searchTerm);
    };
    const renderExtra = ({ item }) => {
        return (
            <FocusButton
                style={{ backgroundColor: '#333', margin: 5, borderRadius: 100 }}
                onPress={() => onSearchExtra(item.name)}
            >
                <Text style={{ paddingHorizontal: 10, padding: 4 }}>
                    {item.name}
                </Text>
            </FocusButton>
        );
    };

    const onPlayChannel = (item, index) => {
        navigation.navigate({
            name: 'Player_Channels',
            params: {
                index: index,
                channels: channels,
                channel: item,
                categories: categories,
                category_index: selectedCategoryIndex,
            },
            merge: true,
        });
    };
    return (
        <Block
            width={sizes.width}
            align="center"
            justify="center"
            color={'transparent'}
        >
            {showVoiceEnabled && (
                <View
                    style={{
                        borderRadius: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        position: 'absolute',
                        width: sizes.width * 0.3,
                        height: sizes.width * 0.3,
                        zIndex: 99999,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        flex: 1,
                    }}
                >
                    <Animatable.View
                        animation="pulse"
                        easing="ease-in-out"
                        iterationCount="infinite"
                    >
                        <FontAwesome5
                            style={[
                                styles.Shadow,
                                {
                                    color: '#fff',
                                    fontSize: 50,
                                    padding: 0,
                                    margin: 0,
                                },
                            ]}
                            // icon={SolidIcons.microphone}
                            name="microphone"
                        />
                    </Animatable.View>
                </View>
            )}

            <View
                style={{
                    flexDirection: 'row',
                    width: sizes.width,
                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                }}
            >
                <View
                    style={{
                        paddingLeft: 10,
                        marginRight: 20,
                        borderRadius: 100,
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 10,
                    }}
                >
                    <FocusButton
                        style={{ borderRadius: 100 }}
                        onPress={() => onPressBack()}
                    >
                        <FontAwesome5
                            style={{ fontSize: 18, color: '#fff' }}
                            // icon={SolidIcons.arrowLeft}
                            name="arrow-left"
                        />
                    </FocusButton>
                </View>
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'row',
                        alignSelf: 'center',
                        paddingVertical: 5,
                    }}
                >
                    {GLOBAL.UserInterface.channel.enable_sorting_channels ==
                        true && (
                            <Toggle
                                status="control"
                                checked={toggleOrder}
                                onChange={onToggleOrder}
                            >
                                {GLOBAL.Device_IsPortrait
                                    ? ''
                                    : LANG.getTranslation('sorting')}{' '}
                                {sortType}
                            </Toggle>
                        )}
                    {GLOBAL.UserInterface.channel.enable_toggle_channels ==
                        true && (
                            <Toggle
                                status="control"
                                checked={toggleView}
                                onChange={onToggleView}
                            >
                                {GLOBAL.Device_IsPortrait
                                    ? ''
                                    : LANG.getTranslation('toggle_view')}{' '}
                                {viewType}
                            </Toggle>
                        )}
                </View>
            </View>

            <View
                style={{
                    flexDirection: 'column',
                    width: sizes.width,
                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                    paddingTop: 0,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        borderColor: '#999',
                        borderWidth: 1,
                        borderRadius: 100,
                        marginHorizontal: 7,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            width: sizes.width,
                            alignSelf: 'center',
                            paddingVertical: 5,
                            paddingLeft: 20,
                        }}
                    >
                        <Input
                            status="basic"
                            style={{
                                width: '100%',
                                backgroundColor: 'transparent',
                                paddingRight: showVoiceButton ? 0 : 20,
                                borderColor: 'transparent',
                            }}
                            value={searchTerm}
                            placeholder={LANG.getTranslation('filter') + '...'}
                            accessoryLeft={SearchIcon}
                            autoComplete={'off'}
                            underlineColorAndroid="transparent"
                            onChangeText={nextValue =>
                                onSearchChannels(nextValue)
                            }
                        />
                    </View>
                    <View>
                        {showVoiceButton && (
                            <Button
                                style={{ borderRadius: 100 }}
                                appearance="ghost"
                                accessoryLeft={SpeechIcon}
                                onPress={onStartSpeech}
                            />
                        )}
                    </View>
                </View>
                <View style={{ marginLeft: 10 }}>
                    <FlatList
                        key={extraSearchResults}
                        extraData={extraSearchResults}
                        data={extraSearchResults}
                        horizontal={true}
                        removeClippedSubviews={true}
                        keyExtractor={(item, index) => index.toString()}
                        onScrollToIndexFailed={() => { }}
                        renderItem={renderExtra}
                    />
                </View>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    width: sizes.width,
                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                }}
            >
                {!showSearch ? (
                    <View
                        style={{ flex: 1, paddingHorizontal: 5, paddingTop: 7 }}
                    >
                        <OverflowMenu
                            anchor={renderCategoryButton}
                            visible={categoryVisible}
                            selectedIndex={selectedCategoryIndex}
                            fullWidth={true}
                            style={{
                                width: sizes.width * 0.98,
                                marginTop:
                                    GLOBAL.Device_Manufacturer == 'Apple' ||
                                        GLOBAL.Device_IsWebTV
                                        ? 0
                                        : 30,
                            }}
                            onBackdropPress={() => setCategoryVisible(false)}
                            onSelect={onItemSelectCategory}
                        >
                            {categories.map(renderCategoryItem)}
                        </OverflowMenu>
                    </View>
                ) : (
                    <View></View>
                )}
            </View>
            <View style={{ flex: 1, flexDirection: 'row', width: sizes.width }}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
                    style={{ flex: 1, width: sizes.width, height: '100%' }}
                    start={{ x: 0.5, y: 0 }}
                >
                    <View style={{ flex: 1, alignSelf: 'center' }}>
                        {viewType == 'Full' && (
                            <FlatList
                                key={channelColumnsFull}
                                extraData={channels}
                                data={channels}
                                numColumns={channelColumnsFull}
                                horizontal={false}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderChannel}
                            />
                        )}
                        {viewType != 'Full' && (
                            <FlatList
                                key={channelColumnsMini}
                                extraData={channels}
                                data={channels}
                                numColumns={channelColumnsMini}
                                horizontal={false}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderChannel}
                            />
                        )}
                    </View>
                </LinearGradient>
            </View>
        </Block>
    );
};
