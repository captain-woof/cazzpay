import { Button, Flex, Heading, Hide, IconButton, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuItemProps, MenuList, Show, useBreakpointValue, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { FiChevronDown as DownArrowIcon, FiSun as SunIcon, FiMoon as MoonIcon } from "react-icons/fi";
import { HiMenuAlt4 as MenuIcon } from "react-icons/hi";
import { BiHelpCircle as HelpIcon } from "react-icons/bi";
import { AiOutlineLogin as LoginIcon } from "react-icons/ai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePaypal } from "../../../hooks/usePaypal";

export default function AppBar() {

    // For tracking first render
    const [isFirstRendered, setIsFirstRendered] = useState<boolean>(false);
    useEffect(() => {
        setIsFirstRendered(true);
    }, []);

    // For switching themes
    const { colorMode, toggleColorMode } = useColorMode();

    // For Paypal
    const { paypalState } = usePaypal();

    // Icon Button size
    const menuIconButtonSize = useBreakpointValue({ base: "md", md: "lg" });
    const menuIconButtonIconSize = useBreakpointValue({ base: "20", md: "22" });

    // Navbar background
    const navbarBackgroundColor = useColorModeValue("gray.50", "gray.800");

    return (
        <Flex position="fixed" top="0" left="0" width="full" zIndex="docked" boxShadow="md" paddingX="6" paddingY="3" alignItems="center" backgroundColor={navbarBackgroundColor}>
            {/* Logo/name */}
            <Link href="/" passHref><a>
                <Heading>CazzPay</Heading>
            </a></Link>

            {isFirstRendered &&
                /* Nav container */
                <Flex as="nav" marginLeft="auto" gap={{ base: "4", md: "10" }} alignItems="center">

                    {/* Theme changer */}
                    <IconButton aria-label={`Switch to ${colorMode === "dark" ? "light" : "dark"} mode`} icon={colorMode === "dark" ? <MoonIcon /> : <SunIcon />} onClick={toggleColorMode} isRound variant="outline" colorScheme="gray" fontSize={menuIconButtonIconSize} size={menuIconButtonSize} />

                    {/* Nav menu (widescreens) */}
                    <Show above="md">

                        {/* Seller */}
                        <Menu>
                            <MenuButton as={Button} rightIcon={<DownArrowIcon />} variant="unstyled" display="flex">
                                Seller
                            </MenuButton>
                            <MenuList>
                                <Link href="/seller/about" passHref><a><MenuItem icon={<HelpIcon size={16} />}>
                                    About
                                </MenuItem></a></Link>
                                <Link href={paypalState.loggedIn ? "/seller/dashboard" : "/login?as=seller"} passHref><a><MenuItem icon={<LoginIcon size={16} />}>
                                    {paypalState.loggedIn ? "Dashboard" : "Login"}
                                </MenuItem></a></Link>
                            </MenuList>
                        </Menu>

                        {/* Liquidity Provider */}
                        <Menu>
                            <MenuButton as={Button} rightIcon={<DownArrowIcon />} variant="unstyled" display="flex">
                                Liquidity Provider
                            </MenuButton>
                            <MenuList>
                                <Link href="/liquidity-provider/about" passHref><a><MenuItem icon={<HelpIcon size={16} />}>
                                    About
                                </MenuItem></a></Link>
                                <Link href={paypalState.loggedIn ? "/liquidity-provider/dashboard" : "/login?as=liquidity-provider"} passHref><a><MenuItem icon={<LoginIcon size={16} />}>
                                    {paypalState.loggedIn ? "Dashboard" : "Login"}
                                </MenuItem></a></Link>
                            </MenuList>
                        </Menu>
                    </Show>

                    {/* Nav menu (small screens) */}
                    <Hide above="md">
                        <Menu>
                            <MenuButton as={IconButton} aria-label="Open menu" icon={<MenuIcon />} fontSize={menuIconButtonIconSize} isRound variant="outline" colorScheme="gray" size={menuIconButtonSize} />

                            <MenuList>

                                {/* Seller */}
                                <MenuGroup title='Seller'>
                                    <Link href={paypalState.loggedIn ? "/seller/dashboard" : "/login?as=seller"} passHref><a><MenuItemCustom icon={<LoginIcon size={16} />}>
                                        {paypalState.loggedIn ? "Dashboard" : "Login"}
                                    </MenuItemCustom></a></Link>
                                    <Link href="/seller/about" passHref><a><MenuItemCustom icon={<HelpIcon size={16} />}>
                                        Know more
                                    </MenuItemCustom></a></Link>
                                </MenuGroup>
                                <MenuDivider />

                                {/* Liquidity provider */}
                                <MenuGroup title='Liquidity provider'>
                                    <Link href={paypalState.loggedIn ? "/liquidity-provider/dashboard" : "/login?as=liquidity-provider"} passHref><a><MenuItemCustom icon={<LoginIcon size={16} />}>
                                        {paypalState.loggedIn ? "Dashboard" : "Login"}
                                    </MenuItemCustom></a></Link>
                                    <Link href="/liquidity-provider/about" passHref><a><MenuItemCustom icon={<HelpIcon size={16} />}>
                                        Know more
                                    </MenuItemCustom></a></Link>
                                </MenuGroup>

                            </MenuList>
                        </Menu>
                    </Hide>

                </Flex>
            }
        </Flex>
    )
}

/////////////////////
// EXTRA COMPS
/////////////////////
const MenuItemCustom = (props: MenuItemProps) => (
    <MenuItem _focus={{ background: "blue.400", color: "gray.50" }} {...props}>
        {props?.children}
    </MenuItem>
)