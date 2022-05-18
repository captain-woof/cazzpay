import { Box, BoxProps, useBreakpointValue } from "@chakra-ui/react";

interface ContainerProps extends BoxProps {
    adjustForAppBar?: boolean;
    fullViewportHeight?: boolean;
    forReading?: boolean;
}

export default function Container(props: ContainerProps) {

    const fullScreenHeightForAppBarAdjust = useBreakpointValue({ base: "calc(100vh - 4rem)", md: "calc(100vh - 4.5rem)" });

    return (
        <Box width="full" maxWidth={props?.forReading ? "60ch" : "5xl"} marginX="auto" as="section" marginTop={{ base: props.adjustForAppBar ? "4rem" : "0", md: props.adjustForAppBar ? "4.5rem" : "0" }} minHeight={props.fullViewportHeight ? (props.adjustForAppBar ? fullScreenHeightForAppBarAdjust : "100vh") : "auto"} {...props}>
            {props?.children}
        </Box>
    )
}