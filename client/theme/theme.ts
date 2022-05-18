import { Theme, extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
    fonts: {
        body: "'Ubuntu', sans-serif",
        heading: "'Koulen', cursive"
    },
    config: {
        initialColorMode: "system"
    },
    styles: {
        global: (props: any) => ({
            body: {
                backgroundColor: mode("gray.50", "gray.800")(props)
            }
        })
    },
    components: {
        Heading: {
            baseStyle: {
                fontWeight: 400
            }
        }
    }
}) as Theme;

export default theme;
