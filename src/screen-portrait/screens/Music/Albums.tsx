import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Icon,
    Input,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
import {
    sendPageReport,
    sendActionReport,
    sendSearchReport,
} from '../../../reporting/reporting';
import TimerMixin from 'react-timer-mixin';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [albums, setAlbums] = useState([]);
    const [albumsSearch, setAlbumsSearch] = useState([]);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [categories, setCategories] = useState(['']);
    const [searchTerm, setSearchTerm] = useState('');
    const [columns, setColumns] = useState(GLOBAL.Device_IsPortrait ? 2 : 6);
    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);
    const [loaded, setLoaded] = useState(false);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () => sendPageReport('Albums', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var albumsIn = GLOBAL.Albums;
        setAlbumsSearch(albumsIn);
        setAlbums(albumsIn);

        var categoriesIn = [];
        GLOBAL.Album_Categories.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.albums.length,
            };
            categoriesIn.push(categoryOut);
        });
        setSelectedCategoryName(
            categoriesIn[0].name + ' (' + categoriesIn[0].length + ')',
        );
        setSelectedCategoryIndex({ row: 0, section: 0 });
        setCategories(categoriesIn);

        setLoaded(true);

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
                            'Albums',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearchAlbums(splitInput[0]);
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearchAlbums(searchTerm);
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

    const renderAlbum = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenAlbumDetails(item)}>
                <View
                    style={{
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#111',
                        borderWidth: 4,
                    }}
                >
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                            style={{
                                borderRadius: 2,
                                width: sizes.width / columns - 20,
                                height: sizes.width / columns - 20,
                            }}
                        ></Image>
                        <Text
                            bold
                            shadow
                            numberOfLines={1}
                            style={{
                                margin: 10,
                                width: sizes.width / columns - 40,
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );

    const onItemSelectCategory = index => {
        var id = categories[index.row].id;
        var category = GLOBAL.Album_Categories.find(x => x.id == id);
        var albums = [];
        if (category != undefined) {
            GLOBAL.Albums_Selected_Category_ID = id;
            if (category.albums.length > 0) {
                albums = category.albums;
            }
        }
        setSelectedCategoryName(
            category.name + ' (' + category.albums.length + ')',
        );
        setSelectedCategoryIndex(index);
        setCategoryVisible(false);
        setAlbums(albums);
    };
    const renderCategoryButon = () => (
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
    const onStartSearchTimer = searchTerm => {
        TimerMixin.clearTimeout(store_search_timer);
        store_search_timer = TimerMixin.setTimeout(() => {
            sendSearchReport(moment().unix(), searchTerm);
        }, 2000);
    };
    const onSearchAlbums = searchTerm => {
        if (searchTerm.length > 3) {
            onStartSearchTimer(searchTerm);
        }
        var albumsSearch_ = albumsSearch.filter(
            c =>
                c.artist.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||
                c.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1,
        );
        setSearchTerm(searchTerm);
        setAlbums(albumsSearch_);
    };

    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );
    const onOpenAlbumDetails = item => {
        navigation.navigate({
            name: 'Songs',
            params: {
                album: item,
            },
            merge: true,
        });
    };
    const onPressBack = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    return (
        <View
            style={{
                width: sizes.width,
                alignContent: 'center',
                justifyContent: 'center',
            }}
        >
            {showVoiceEnabled && (
                <View
                    style={{
                        borderRadius: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
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
            {loaded && (
                <View
                    style={{
                        flexDirection: 'column',
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                        paddingTop: 10,
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View
                            style={{
                                paddingLeft: 10,
                                marginRight: 0,
                                borderRadius: 100,
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
                                flex: 1,
                                flexDirection: 'row',
                                borderColor: '#999',
                                borderWidth: 1,
                                borderRadius: 100,
                                marginHorizontal: 20,
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
                                    autoComplete={'off'}
                                    placeholder={
                                        LANG.getTranslation('filter') + '...'
                                    }
                                    accessoryLeft={SearchIcon}
                                    underlineColorAndroid="transparent"
                                    onChangeText={nextValue =>
                                        onSearchAlbums(nextValue)
                                    }
                                />
                            </View>
                            <View style={{ alignSelf: 'center' }}>
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
                        flex: 1,
                        paddingHorizontal: 5,
                        paddingVertical: 10,
                        paddingTop: 20,
                    }}
                >
                    <OverflowMenu
                        anchor={renderCategoryButon}
                        visible={categoryVisible}
                        selectedIndex={selectedCategoryIndex}
                        fullWidth={true}
                        style={{
                            width: sizes.width * 0.98,
                            marginTop:
                                GLOBAL.Device_Manufacturer == 'Apple' ? 0 : 0,
                        }}
                        onBackdropPress={() => setCategoryVisible(false)}
                        onSelect={onItemSelectCategory}
                    >
                        {categories.map(renderCategoryItem)}
                    </OverflowMenu>
                </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', width: sizes.width }}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
                    style={{
                        flex: 1,
                        width: sizes.width,
                        minHeight: sizes.height,
                    }}
                    start={{ x: 0.5, y: 0 }}
                >
                    <View style={{ flex: 1 }}>
                        {albums != undefined && (
                            <FlatList
                                key={searchTerm}
                                extraData={searchTerm}
                                data={albums}
                                numColumns={columns}
                                horizontal={false}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderAlbum}
                            />
                        )}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};
