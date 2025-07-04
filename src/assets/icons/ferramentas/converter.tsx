import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const IconConverter = (props: SvgProps) => {
  return (
    <Svg
      width="100px"
      height="100px"
      viewBox="0,0,256,256"
      {...props}
    >
      <Path
        d="M9.25 4.479A1.5 1.5 0 007.773 6v7.637a1.5 1.5 0 001.5 1.5h7.635a1.5 1.5 0 100-3H12.54A16.417 16.417 0 0124 7.5c3.84 0 7.36 1.306 10.162 3.5a1.5 1.5 0 101.848-2.363A19.438 19.438 0 0024 4.5c-5.098 0-9.749 1.966-13.227 5.178V6A1.5 1.5 0 009.25 4.479zm30.568 8.613a1.636 1.636 0 100 3.271 1.636 1.636 0 100-3.271zM6 18.547a1.636 1.636 0 100 3.271 1.636 1.636 0 100-3.271zm36 1.09a1.636 1.636 0 100 3.271 1.636 1.636 0 100-3.271zM6 25.092a1.636 1.636 0 100 3.271 1.636 1.636 0 100-3.271zm36 1.09a1.636 1.636 0 100 3.271 1.636 1.636 0 100-3.271zM8.182 31.637a1.636 1.636 0 10.058 3.271 1.636 1.636 0 00-.058-3.271zm22.91 1.226a1.5 1.5 0 100 3h4.369A16.417 16.417 0 0124 40.5c-3.84 0-7.36-1.306-10.162-3.5a1.5 1.5 0 10-1.848 2.363A19.438 19.438 0 0024 43.5c5.098 0 9.749-1.966 13.227-5.178V42a1.5 1.5 0 103 0v-7.637a1.5 1.5 0 00-1.5-1.5z"
        transform="scale(5.33333)"
        fill="#49d983"
        strokeMiterlimit={10}
      />
    </Svg>
  )
}

export default IconConverter;
