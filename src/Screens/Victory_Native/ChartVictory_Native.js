import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  Area,
  Bar,
  CartesianChart,
  Line,
  useAnimatedPath,
  useChartPressState,
  useLinePath,
  StackedBar,
} from 'victory-native';
import {
  Circle,
  Path,
  useFont,
  Text as SkiaText,
  vec,
  LinearGradient,
  center,
} from '@shopify/react-native-skia';
import inter from "../../Assets/fonts/Inter-Bold.ttf";
import {candleStickData, DATA_For_One_Month} from '../../utils/util';
import {useDerivedValue} from 'react-native-reanimated';
import {darkTheme, lightTheme} from '../../Style/theme';
const footer = 'Temp Graph';

export default function ChartVictoryNative() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const font = useFont(inter, 11);
  if (!font) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <FlatList
      style={{
        backgroundColor: theme.backgroundColor,
      }}
      data={DATA_For_One_Month}
      keyExtractor={(item, index) => index.toString()}
      ListFooterComponent={
        <Text
          style={[
            styles.footer,
            {
              fontSize: 20,
              textDecorationLine: 'underline',
              color: theme.textColor,
            },
          ]}>
          {footer}
        </Text>
      }
      renderItem={({item, index}) => {
        return (
          <Chart
            data={item.data}
            font={font}
            footer={item.title}
            theme={theme}
          />
        );
      }}
    />
  );
}

function ToolTip({x, y, color, activeValue}) {

  const font = useFont(inter, 11);
  const activeValueDisplay = useDerivedValue(() =>
    activeValue?.value.toFixed(2),
  );
  const activeValueWidth = useDerivedValue(
    () => font?.measureText(activeValueDisplay.value).width || 0,
  );
  const activeValueX = useDerivedValue(
    () => x.value - activeValueWidth.value / 2,
  );
  const activeValueY = useDerivedValue(
    () => y.value - activeValueWidth.value / 2,
  );
  const activeValueY1 = useDerivedValue(() => y.value - 3);
  return (
    <>
      <Circle cx={x} cy={activeValueY1} r={4} color={color} />
      <SkiaText
        x={activeValueX}
        y={activeValueY}
        text={activeValueDisplay}
        color={color}
        font={font}
      />
    </>
  );
}

function MyAnimatedLine({points, color, strokeWidth}) {
  const {path} = useLinePath(points);
  const animPath = useAnimatedPath(path);

  return (
    <Path
      path={animPath}
      style="stroke"
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}

const Chart = ({data, font, footer, theme}) => {
  const {state, isActive} = useChartPressState({x: 0, y: {highTmp: 0}});
  const [roundedCorner] = useState(5);
  const [innerPadding] = useState(0.33);
  let activeXItem = useDerivedValue(() => {
    return data.findIndex(value => value.day === state.x.value.value);
  }).value;
  if (activeXItem < 0) {
    activeXItem = 2;
  }

  return (
    <>
      <ScrollView horizontal>
        <View style={{width: data.length * 20, height: 250}}>
          <CartesianChart
            data={data}
            xKey="day"
            yKeys={['highTmp', 'topTmp']}
            domain={{y: [-50, 150]}}
            axisOptions={{
              font,
              // tickCount:data?.length/2,
              labelColor: {x: theme.graphLableColor, y: theme.graphLableColor},
              lineColor: theme.graphLableColor,
              lineWidth: 0.2,
            }}
            padding={5}
            domainPadding={20}
            chartPressState={state}>
            {({points, chartBounds}) => {
              return (
                <>
                  <StackedBar
                    innerPadding={innerPadding}
                    chartBounds={chartBounds}
                    points={[points.highTmp, points.topTmp]}
                    barOptions={({isBottom, isTop, columnIndex, rowIndex}) => {
                      return {
                        roundedCorners: isTop
                          ? {
                              topLeft: roundedCorner,
                              topRight: roundedCorner,
                            }
                          : isBottom
                          ? {
                              bottomRight: roundedCorner,
                              bottomLeft: roundedCorner,
                            }
                          : undefined,
                        children:
                          rowIndex % 2 === 0 && columnIndex === 1 ? (
                            <LinearGradient
                              start={vec(100, 100)}
                              end={vec(10, 100)}
                              colors={['purple', 'purple']}
                            />
                          ) : (
                            <LinearGradient
                              start={vec(100, 100)}
                              end={vec(10, 100)}
                              colors={['red', 'orange']}
                            />
                          ),
                      };
                    }}
                  />
                  <LinearGradient
                    colors={['#9C51B6', '#5946B2', '#fff']}
                    start={vec(0, 0)}
                    end={vec(0, 400)}
                  />
                    {isActive && (
                  <ToolTip
                    x={state.x.position}
                    y={state.y.highTmp.position}
                    color={theme.graphTooltipTextColor}
                    activeValue={state.y.highTmp.value}
                  />
                )}
                </>
              );
            }}
          </CartesianChart>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View style={{width: data.length * 20, height: 250}}>
          <CartesianChart
            data={data}
            xKey="day"
            yKeys={['highTmp']}
            axisOptions={{
              font,
              // tickCount:data?.length/2,
              labelColor: {x: theme.graphLableColor, y: theme.graphLableColor},
              lineColor: theme.graphLableColor,
              lineWidth: 0.2,
            }}
            domainPadding={20}
            chartPressState={state}>
            {({points, chartBounds}) => (
              <>
                <MyAnimatedLine
                  points={points?.highTmp}
                  color="red"
                  strokeWidth={1}
                />
                {isActive && (
                  <ToolTip
                    x={state.x.position}
                    y={state.y.highTmp.position}
                    color={theme.graphTooltipTextColor}
                    activeValue={state.y.highTmp.value}
                  />
                )}
              </>
            )}
          </CartesianChart>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View style={{width: data.length * 20, height: 250}}>
          <CartesianChart
            data={data}
            xKey="day"
            yKeys={['highTmp']}
            domainPadding={20}
            axisOptions={{
              font,
              // tickCount:data?.length/2,
              labelColor: {x: theme.graphLableColor, y: theme.graphLableColor},
              lineColor: theme.graphLableColor,
              lineWidth: 0.2,
              // formatXLabel(value) {
              //   const date = new Date(2023, value - 1)
              //   return date.toLocaleString("default", { month: "short" })
              // },
            }}
            chartPressState={state}>
            {({points, chartBounds}) => (
              <>
                <ToolTip
                  x={state.x.position}
                  y={state.y.highTmp.position}
                  color={theme.graphTooltipTextColor}
                  activeValue={state.y.highTmp.value}
                />

                {points.highTmp.map((point, index) => {
                  return (
                    <Bar
                      key={index}
                      barCount={points.highTmp.length}
                      points={[point]}
                      chartBounds={chartBounds}
                      animate={{type: 'spring'}}
                      roundedCorners={{
                        topLeft: 5,
                        topRight: 5,
                      }}>
                      <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, 400)}
                        colors={
                          index === activeXItem
                            ? ['#FFF', 'green']
                            : ['#9C51B6', '#5946B2', '#fff']
                        }
                      />
                    </Bar>
                  );
                })}
              </>
            )}
          </CartesianChart>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View style={{width: data.length * 20, height: 250}}>
          <CartesianChart
            data={data}
            xKey="day"
            yKeys={['highTmp']}
            domainPadding={20}
            axisOptions={{
              font,
              // tickCount:data?.length/2,
              labelColor: {x: theme.graphLableColor, y: theme.graphLableColor},
              lineColor: theme.graphLableColor,
              lineWidth: 0.2,
              // formatXLabel(value) {
              //   const date = new Date(2023, value - 1)
              //   return date.toLocaleString("default", { month: "short" })
              // },
            }}
            chartPressState={state}>
            {({points, chartBounds}) => (
              <>
                {isActive && (
                  <ToolTip
                    x={state.x.position}
                    y={state.y.highTmp.position}
                    color={theme.graphTooltipTextColor}
                    activeValue={state.y.highTmp.value}
                  />
                )}

                {points.highTmp.map((point, index) => {
                  return (
                    <Bar
                      key={index}
                      barCount={points.highTmp.length}
                      points={[point]}
                      chartBounds={chartBounds}
                      animate={{type: 'spring'}}
                      roundedCorners={{
                        topLeft: 5,
                        topRight: 5,
                      }}
                      // color={
                      //   index === 5 || index === 25 || index === 15
                      //     ? 'red'
                      //     : 'rgba(154,205,50,0.6)'
                      // }
                    >
                      <LinearGradient
                        colors={
                          index === 5 || index === 25 || index === 15
                            ? ['red', '#fff']
                            : ['rgba(154,205,50,0.6)', '#fff']
                        }
                        start={vec(0, 0)}
                        end={vec(0, 400)}
                      />
                    </Bar>
                  );
                })}
              </>
            )}
          </CartesianChart>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View style={{width: data.length * 20, height: 250}}>
          <CartesianChart
            data={data}
            xKey="day"
            yKeys={['highTmp']}
            domainPadding={20}
            axisOptions={{
              font,
              // tickCount:data?.length/2,
              labelColor: {x: theme.graphLableColor, y: theme.graphLableColor},
              lineColor: theme.graphLableColor,
              lineWidth: 0.2,
              // formatXLabel(value) {
              //   const date = new Date(2023, value - 1)
              //   return date.toLocaleString("default", { month: "short" })
              // },
            }}
            chartPressState={state}>
            {({points, chartBounds}) => (
              <>
                <Bar
                  chartBounds={chartBounds}
                  points={points.highTmp}
                  roundedCorners={{
                    topLeft: 5,
                    topRight: 5,
                  }}
                />
                <LinearGradient
                  colors={['#9C51B6', '#5946B2', '#fff']}
                  start={vec(0, 0)}
                  end={vec(0, 400)}
                />
                {isActive && (
                  <ToolTip
                    x={state.x.position}
                    y={state.y.highTmp.position}
                    color={theme.graphTooltipTextColor}
                    activeValue={state.y.highTmp.value}
                  />
                )}
              </>
            )}
          </CartesianChart>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View style={{width: data.length * 20, height: 250}}>
          <CartesianChart
            data={data}
            xKey="day"
            yKeys={['highTmp']}
            axisOptions={{
              font,
              // tickCount:data?.length/2,
              labelColor: {x: theme.graphLableColor, y: theme.graphLableColor},
              lineColor: theme.graphLableColor,
              lineWidth: 0.2,
            }}
            domainPadding={0}
            chartPressState={state}>
            {({points, chartBounds}) => (
              <>
                <MyAnimatedLine
                  points={points?.highTmp}
                  color="red"
                  strokeWidth={1}
                />
                <Area
                  points={points.highTmp}
                  y0={chartBounds.bottom}
                  color="red"
                  animate={{type: 'timing', duration: 300}}
                  opacity={0.3}
                />
                {isActive && (
                  <ToolTip
                    x={state.x.position}
                    y={state.y.highTmp.position}
                    color={theme.graphTooltipTextColor}
                    activeValue={state.y.highTmp.value}
                  />
                )}
              </>
            )}
          </CartesianChart>
        </View>
      </ScrollView>
    </>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#000',
  },
  footer: {
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});
