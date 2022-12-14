import React, {PureComponent} from 'react';
import {View} from 'react-native';
import App_List_Item from './App_List_item';

class App_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const apps = this.props.Apps;
        const columns = this.props.Columns;

        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={apps}
                Width={this.props.Width}
                numColumns={columns}
                horizontal={this.props.horizontal != undefined ? true : false}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}

                // onContentSizeChange={() => {
                //     if (channels != undefined && this.props.Type != "Favorite" && this.props.Type != "Home" && this.props.scrollType != 'Search') {
                //         try {
                //             if (this.flatList.scrollToIndex && this.state.scrolled == false && channels.length > 0) {
                //                 this.setState({
                //                     scrolled: true
                //                 })
                //                 this.flatList.scrollToIndex({ index: noscroll != undefined ? 0 : this.props.Type == 'TV' ? GLOBAL.Channels_Selected_Index : GLOBAL.Channels_Selected_Row, animated: false, viewPosition: 0 });
                //             }
                //         } catch (e) {

                //         }
                //     }
                // }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <App_List_Item
            App={item}
            Index={index}
            Width={this.props.Width}
            onPress={app => this.props.onPress(app)}
        />
    );
}

export default App_List;
