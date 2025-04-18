import { colors } from "./src/styles/colors";


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      vars: colors.light,
      fontFamily: {
        'orbitron': ['Orbitron_400Regular'],
        'orbitron-medium': ['Orbitron_500Medium'],
        'orbitron-semibold': ['Orbitron_600SemiBold'],
        'inter': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'poppins': ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold']
      }
    },
  },
  plugins: [],
}