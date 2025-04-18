import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const IconGraph = (props: SvgProps) => {
  return (
    <Svg
      width="100px"
      height="100px"
      viewBox="0,0,256,256"
      {...props}
    >
      <Path
        d="M4 4v42h42v-2H6V4zm9 2a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zm1.98 7.99a1 1 0 00-.687.303L33 25.586l-9.293-9.293a1 1 0 00-1.414 0l-14 14a1 1 0 101.414 1.414L23 18.414l9.293 9.293a1 1 0 001.414 0l12-12a1 1 0 00-.727-1.717zM13 16a1 1 0 100 2 1 1 0 000-2zm20 0a1 1 0 100 2 1 1 0 000-2zM23 26a1 1 0 100 2 1 1 0 000-2zm20 0a1 1 0 100 2 1 1 0 000-2zM13 36a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
        transform="scale(5.12)"
        fill="#49d983"
        strokeMiterlimit={10}
      />
    </Svg>
  )
}

export default IconGraph;
