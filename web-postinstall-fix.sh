# https://github.com/necolas/react-native-web/issues/1537
# https://github.com/archriss/react-native-snap-carousel/issues/770

echo 'Fixing PropTypes issues'

if test -f node_modules/react-native-web/dist/exports/ViewPropTypes/index.js; then
   echo "ViewPropTypes problem fixed already!"
else
    mkdir node_modules/react-native-web/dist/exports/ViewPropTypes
    touch node_modules/react-native-web/dist/exports/ViewPropTypes/index.js
    echo 'var ViewPropTypes = { style: null }; export default ViewPropTypes;'>> node_modules/react-native-web/dist/exports/ViewPropTypes/index.js
    echo "export { default as ViewPropTypes } from './exports/ViewPropTypes';">> node_modules/react-native-web/dist/index.js
fi

if grep -qs "Text.propTypes" node_modules/react-native-web/dist/exports/Text/index.js
then
   echo "Text props types problem fixed already!"
else
    echo 'Text.propTypes = {}'>> node_modules/react-native-web/dist/exports/Text/index.js
fi