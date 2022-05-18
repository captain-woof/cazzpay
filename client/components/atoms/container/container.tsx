import { Box, BoxProps } from "@chakra-ui/react";


export default function Container(props: BoxProps){
    return (
        <Box width="full" maxWidth="5xl" marginX="auto" as="section" {...props}>
            {props?.children}
        </Box>
    )
}