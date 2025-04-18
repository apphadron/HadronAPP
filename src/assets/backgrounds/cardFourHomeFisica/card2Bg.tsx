import * as React from "react"
import Svg, { SvgProps, G, Rect, Circle, Ellipse, Defs, ClipPath } from "react-native-svg"
import { StyleSheet } from "react-native"

const Card2Bg = (props: SvgProps) => {
  return (
    <Svg
      viewBox="0 0 120 160"
      fill="none"
      {...props}
      style={{ ...StyleSheet.absoluteFillObject }}
    >
      <G clipPath="url(#clip0_1582_64)" fill="#7141A1">
        <Rect  rx={10} fillOpacity={0.5} />
        <Circle cx={25.5} cy={28.5} r={36.5} fillOpacity={0.4} />
        <Ellipse cx={13.5} cy={133.5} rx={43.5} ry={52.5} fillOpacity={0.4} />
        <Ellipse cx={125.5} cy={77} rx={38.5} ry={46} fillOpacity={0.4} />
      </G>
      <Defs>
        <ClipPath id="clip0_1582_64">
          <Rect rx={10} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Card2Bg;
