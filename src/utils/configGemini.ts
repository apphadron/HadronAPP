interface GameConfig {
    API_KEY: string | undefined;
    API_URL: string | undefined;
    MAX_TOKENS: number;
    SAFETY_SETTINGS: any[];
  }
  
  const GEMINI_GAME_CONFIG: GameConfig = {
    API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    API_URL: process.env.EXPO_PUBLIC_GEMINI_URL,
    MAX_TOKENS: 2048,
    SAFETY_SETTINGS: [
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH"
      }
    ]
  };
  
  export default GEMINI_GAME_CONFIG;