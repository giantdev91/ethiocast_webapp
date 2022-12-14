import React, {Component} from 'react';
import {Router, Scene, Actions} from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';

//Pages
import EPG from '../screens-landscape/components/Epg/EPG';
import Home from '../screens-landscape/home/Home';
import Authentication from '../screens-landscape/auth/Authentication';
import Auth_Keyboard from '../screens-landscape/components/Keyboard/Auth_Keyboard';
import Parental_Keyboard from '../screens-landscape/components/Keyboard/Parental_Keyboard';
import Authentication_Text from '../screens-landscape/auth/Authentication_Text';
import Device from '../screens-landscape/auth/Device';
import Imports from '../screens-landscape/auth/Imports';
import Sizing from '../screens-landscape/auth/Sizing';
import Register from '../screens-landscape/auth/Register';
import Register_Email from '../screens-landscape/auth/Register_Email';
import Profiles from '../screens-landscape/auth/Profiles';
import Messages from '../screens-landscape/inbox/Messages';
import CreateProfile from '../screens-landscape/auth/CreateProfile';
import EditProfile from '../screens-landscape/auth/EditProfile';
import Languages from '../screens-landscape/auth/Languages';
import Forgot from '../screens-landscape/auth/Forgot';
import Empty from '../screens-landscape/auth/Empty';
import NoService from '../screens-landscape/auth/NoService';
import Services from '../screens-landscape/auth/Services';
import Services_Text from '../screens-landscape/auth/Services_Text';
import DataLoader from '../screens-landscape/auth/DataLoader';
import Connect from '../screens-landscape/auth/Connect';
import MarketPlace from '../screens-landscape/apps/MarketPlace';
import Movies_Details from '../screens-landscape/movies/Movies_Details';
import Movies_Tags_Details from '../screens-landscape/movies/Movies_Tags_Details';
import Movies_Stores from '../screens-landscape/movies/Movies_Stores';
import Movies_Categories from '../screens-landscape/movies/Movies_Categories';
import Movies_Tags from '../screens-landscape/movies/Movies_Tags';
import Music_Albums from '../screens-landscape/music/Music_Albums';
import Music_Details from '../screens-landscape/music/Music_Details';
import Player_Movies from '../screens-landscape/players/Player_Movies';
import Player_M3U from '../screens-landscape/players/Player_M3U';
import Player_Series from '../screens-landscape/players/Player_Series';
import Player_Recordings from '../screens-landscape/players/Player_Recordings';
import Player_Education from '../screens-landscape/players/Player_Education';
import Player from '../screens-landscape/players/Player';
import Series_Details from '../screens-landscape/series/Series_Details';
import Series_Stores from '../screens-landscape/series/Series_Stores';
import Education_Details from '../screens-landscape/education/Education_Details';
import Education_Stores from '../screens-landscape/education/Education_Stores';
import Settings from '../screens-landscape/settings/Settings';
import Support from '../screens-landscape/settings/Support';
import Recordings from '../screens-landscape/television/Recordings';
import Channels from '../screens-landscape/television/Channels';
import Catchup from '../screens-landscape/television/Catchup';
import Search from '../screens-landscape/components/Epg/Search';
import Ads_Campaign from '../screens-landscape/home/Ads_Campaign';
import SearchBox from '../screens-landscape/search/SearchBox';
import MyList from '../screens-landscape/home/MyList';
import MyFavorites from '../screens-landscape/home/MyFavorites';
import MyContent from '../screens-landscape/home/MyContent';

import ButtonSmall from '../screens-landscape/components/Buttons/Buttons_Small';
import ButtonNormal from '../screens-landscape/components/Buttons/Button_Normal';
import ButtonAutoSize from '../screens-landscape/components/Buttons/Button_AutoSize';
import ButtonSized from '../screens-landscape/components/Buttons/Button_Sized';
import Loader from '../screens-landscape/components/Loaders/Loader';
import ButtonRounded from '../screens-landscape/components/Buttons/Button_Rounded';
import Keyboard from '../screens-landscape/components/Keyboard/Keyboard';
import RadioButton from '../screens-landscape/components/Buttons/Radio_Button';
import InputStandard from '../screens-landscape/components/Inputs/Input_Standard';
import InputCode from '../screens-landscape/components/Inputs/Input_Code';
import ButtonCircle from '../screens-landscape/components/Buttons/Button_Circle';
import Scrubber from '../screens-landscape/components/Scrubber/Scrubber';
import ScaledImage from '../screens-landscape/components/Images/ScaledImage';
import ChannelList from '../screens-landscape/components/UI/Channels/Channel_List';
import AlbumList from '../screens-landscape/components/UI/Music/Album_List';
import AppList from '../screens-landscape/components/UI/Apps/App_List';
import CategoryList from '../screens-landscape/components/UI/Categories/Category_List';
import StoreList from '../screens-landscape/components/UI/Stores/Store_List';
import SeriesList from '../screens-landscape/components/UI/Series/Series_List';
import MovieList from '../screens-landscape/components/UI/Movies/Movie_List';
import EpgList from '../screens-landscape/components/UI/EPG/EPG_List';
import Rails from '../screens-landscape/components/Rails/Rails';
import Modal from '../screens-landscape/components/Modal/Modal';
import ButtonFullSize from '../screens-landscape/components/Buttons/Button_FullSize';
import InputSearch from '../screens-landscape/components/Inputs/Input_Search';
import Markers from '../screens-landscape/components/Markers/Markers';
import Container from '../screens-landscape/components/Container';
import TouchableHighlightFocus from '../screens-landscape/components/FocusButton';
class app extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
    }
    componentDidMount() {
        global.ScaledImage = ScaledImage;
        global.Parental_Keyboard = Parental_Keyboard;
        global.ButtonSmall = ButtonSmall;
        global.ButtonNormal = ButtonNormal;
        global.ButtonAutoSize = ButtonAutoSize;
        global.ButtonSized = ButtonSized;
        global.RadioButton = RadioButton;
        global.InputStandard = InputStandard;
        global.CategoryList = CategoryList;
        global.Scrubber = Scrubber;
        global.ButtonCircle = ButtonCircle;
        global.InputCode = InputCode;
        global.InputSearch = InputSearch;
        global.ChannelList = ChannelList;
        global.AlbumList = AlbumList;
        global.AppList = AppList;
        global.StoreList = StoreList;
        global.SeriesList = SeriesList;
        global.MovieList = MovieList;
        global.ButtonRounded = ButtonRounded;
        global.Keyboard = Keyboard;
        global.EpgList = EpgList;
        global.Markers = Markers;
        global.Modal = Modal;
        global.ButtonFullSize = ButtonFullSize;
        global.Loader = Loader;
        global.Rails = Rails;
        global.Container = Container;
        global.TouchableHighlightFocus = TouchableHighlightFocus;
        Actions.Device();
    }
    componentWillUnmount() {
        TimerMixin.clearTimeout(this.timer1);
    }
    render() {
        return (
            <Router
                sceneStyle={{
                    backgroundColor: 'transparent',
                }}
            >
                <Scene key="root" headerMode="none" hideNavBar={true}>
                    <Scene
                        component={Empty}
                        hideNavBar={true}
                        key="Empty"
                        title="Empty"
                        type="reset"
                    />
                    <Scene
                        component={Sizing}
                        hideNavBar={true}
                        key="Sizing"
                        title="Sizing"
                        type="reset"
                    />
                    <Scene
                        component={Device}
                        hideNavBar={true}
                        key="Device"
                        title="Device"
                        type="reset"
                    />
                    <Scene
                        component={Imports}
                        hideNavBar={true}
                        key="Imports"
                        title="Imports"
                        type="reset"
                    />
                    <Scene
                        component={Languages}
                        hideNavBar={true}
                        key="Languages"
                        title="Languages"
                        type="reset"
                    />
                    <Scene
                        component={Services}
                        hideNavBar={true}
                        key="Services"
                        title="Services"
                        type="reset"
                    />
                    <Scene
                        component={Services_Text}
                        hideNavBar={true}
                        key="Services_Text"
                        title="Services_Text"
                        type="reset"
                    />
                    <Scene
                        component={Authentication}
                        hideNavBar={true}
                        key="Authentication"
                        title="Authentication"
                        type="reset"
                    />
                    <Scene
                        component={Auth_Keyboard}
                        hideNavBar={true}
                        key="Auth_Keyboard"
                        title="Auth_Keyboard"
                        type="reset"
                    />
                    <Scene
                        component={Parental_Keyboard}
                        hideNavBar={true}
                        key="Parental_Keyboard"
                        title="Parental_Keyboard"
                        type="reset"
                    />
                    <Scene
                        component={Authentication_Text}
                        hideNavBar={true}
                        key="Authentication_Text"
                        title="Authentication_Text"
                        type="reset"
                    />
                    <Scene
                        component={Connect}
                        hideNavBar={true}
                        key="Connect"
                        title="Connect"
                        type="reset"
                    />
                    <Scene
                        component={Profiles}
                        hideNavBar={true}
                        key="Profiles"
                        title="Profiles"
                        type="reset"
                    />
                    <Scene
                        component={CreateProfile}
                        hideNavBar={true}
                        key="CreateProfile"
                        title="CreateProfile"
                        type="reset"
                    />
                    <Scene
                        component={EditProfile}
                        hideNavBar={true}
                        key="EditProfile"
                        title="EditProfile"
                        type="reset"
                    />
                    <Scene
                        component={Forgot}
                        hideNavBar={true}
                        key="Forgot"
                        title="Forgot"
                        type="reset"
                    />
                    <Scene
                        component={DataLoader}
                        hideNavBar={true}
                        key="DataLoader"
                        title="DataLoader"
                        type="reset"
                    />
                    <Scene
                        component={Home}
                        hideNavBar={true}
                        key="Home"
                        title="Home"
                        type="reset"
                    />
                    <Scene
                        component={Channels}
                        hideNavBar={true}
                        key="Channels"
                        title="Channels"
                        type="reset"
                    />

                    <Scene
                        component={Recordings}
                        hideNavBar={true}
                        key="Recordings"
                        title="Recordings"
                        type="reset"
                    />
                    <Scene
                        component={Settings}
                        hideNavBar={true}
                        key="Settings"
                        title="Settings"
                        type="reset"
                    />

                    <Scene
                        component={Support}
                        hideNavBar={true}
                        key="Support"
                        title="Support"
                        type="reset"
                    />

                    <Scene
                        component={Register_Email}
                        hideNavBar={true}
                        key="Register_Email"
                        title="Register_Email"
                        type="reset"
                    />

                    <Scene
                        component={Catchup}
                        hideNavBar={true}
                        key="Catchup"
                        title="Catchup"
                        type="reset"
                    />

                    <Scene
                        component={Register}
                        hideNavBar={true}
                        key="Register"
                        title="Register"
                        type="reset"
                    />
                    <Scene
                        component={Series_Stores}
                        hideNavBar={true}
                        key="Series_Stores"
                        title="Series"
                        type="reset"
                    />
                    <Scene
                        component={Series_Details}
                        hideNavBar={true}
                        key="Series_Details"
                        title="Series_Details"
                        type="reset"
                    />
                    <Scene
                        component={Education_Stores}
                        hideNavBar={true}
                        key="Education_Stores"
                        title="Education_Stores"
                        type="reset"
                    />
                    <Scene
                        component={Education_Details}
                        hideNavBar={true}
                        key="Education_Details"
                        title="Education_Details"
                        type="reset"
                    />
                    <Scene
                        component={Player_M3U}
                        hideNavBar={true}
                        key="Player_M3U"
                        title="Player_M3U"
                        type="reset"
                    />
                    <Scene
                        component={Player_Movies}
                        hideNavBar={true}
                        key="Player_Movies"
                        title="Player_Movies"
                        type="reset"
                    />
                    <Scene
                        component={Player_Series}
                        hideNavBar={true}
                        key="Player_Series"
                        title="Player_Series"
                        type="reset"
                    />
                    <Scene
                        component={Player}
                        hideNavBar={true}
                        key="Player"
                        title="Player"
                        type="reset"
                    />
                    <Scene
                        component={Player_Recordings}
                        hideNavBar={true}
                        key="Player_Recordings"
                        title="Player_Recordings"
                        type="reset"
                    />
                    <Scene
                        component={Player_Education}
                        hideNavBar={true}
                        key="Player_Education"
                        title="Player_Education"
                        type="reset"
                    />
                    <Scene
                        component={Music_Albums}
                        hideNavBar={true}
                        key="Music_Albums"
                        title="Music_Albums"
                        type="reset"
                    />
                    <Scene
                        component={Music_Details}
                        hideNavBar={true}
                        key="Music_Details"
                        title="Music_Details"
                        type="reset"
                    />
                    <Scene
                        component={Movies_Stores}
                        hideNavBar={true}
                        key="Movies_Stores"
                        title="Movies_Stores"
                        type="reset"
                    />
                    <Scene
                        component={Movies_Details}
                        hideNavBar={true}
                        key="Movies_Details"
                        title="Movies_Details"
                        type="reset"
                    />
                    <Scene
                        component={Movies_Categories}
                        hideNavBar={true}
                        key="Movies_Categories"
                        title="Movies_Categories"
                        type="reset"
                    />
                    <Scene
                        component={Movies_Tags}
                        hideNavBar={true}
                        key="Movies_Tags"
                        title="Movies_Tags"
                        type="reset"
                    />
                    <Scene
                        component={Movies_Tags_Details}
                        hideNavBar={true}
                        key="Movies_Tags_Details"
                        title="Movies_Tags_Details"
                        type="reset"
                    />
                    <Scene
                        component={MarketPlace}
                        hideNavBar={true}
                        key="MarketPlace"
                        title="Apps"
                        type="reset"
                    />

                    <Scene
                        component={Messages}
                        hideNavBar={true}
                        key="Messages"
                        title="Messages"
                        type="reset"
                    />

                    <Scene
                        component={Ads_Campaign}
                        hideNavBar={true}
                        key="Ads_Campaign"
                        title="Ads_Campaign"
                        type="reset"
                    />
                    <Scene
                        component={SearchBox}
                        hideNavBar={true}
                        key="SearchBox"
                        title="SearchBox"
                        type="reset"
                    />
                    <Scene
                        component={MyList}
                        hideNavBar={true}
                        key="MyList"
                        title="MyList"
                        type="reset"
                    />
                    <Scene
                        component={MyFavorites}
                        hideNavBar={true}
                        key="MyFavorites"
                        title="MyFavorites"
                        type="reset"
                    />
                    <Scene
                        component={MyContent}
                        hideNavBar={true}
                        key="MyContent"
                        title="MyContent"
                        type="reset"
                    />

                    <Scene
                        component={Search}
                        hideNavBar={true}
                        key="Search"
                        title="Search"
                        type="reset"
                    />

                    <Scene
                        component={NoService}
                        hideNavBar={true}
                        key="NoService"
                        title="NoService"
                        type="reset"
                    />
                    <Scene
                        component={EPG}
                        hideNavBar={true}
                        key="EPG"
                        title="EPG"
                        type="reset"
                    />
                </Scene>
            </Router>
        );
    }
}
export default app;
